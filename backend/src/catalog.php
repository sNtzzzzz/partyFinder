<?php
declare(strict_types=1);
require_once __DIR__ . '/auth-common.php';

function catalogRecord(array $row, bool $admin = false): array {
    $document = json_decode($row['document'], true, 64, JSON_THROW_ON_ERROR);
    if ($admin) return ['venue' => $document, 'published' => (bool)$row['published'],
        'revision' => (int)$row['revision'], 'updatedAt' => $row['updated_at']];
    return $document;
}

function catalogText(array $input, string $key, int $maximum, bool $required = false): string {
    $value = trim(inputText($input, $key));
    if (($required && $value === '') || mb_strlen($value) > $maximum || preg_match('/[\x00-\x1f\x7f]/u', $value)) {
        throw new AuthError('Confira o campo ' . $key . '.', 422);
    }
    return $value;
}

function catalogHours(mixed $hours): ?array {
    if ($hours === null) return null;
    if (!is_array($hours) || !array_is_list($hours) || count($hours) !== 7) throw new AuthError('Informe os sete dias de funcionamento.', 422);
    foreach ($hours as $day) {
        if ($day === null) continue;
        if (!is_array($day) || !array_is_list($day) || count($day) > 4) throw new AuthError('Horários inválidos.', 422);
        foreach ($day as $interval) {
            if (!is_array($interval) || !array_is_list($interval) || count($interval) !== 2) throw new AuthError('Intervalo inválido.', 422);
            foreach ($interval as $time) {
                if (!is_string($time) || !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $time)) throw new AuthError('Use horários no formato HH:MM.', 422);
            }
        }
    }
    return $hours;
}

function catalogUrl(string $value): string {
    if ($value !== '' && (!filter_var($value, FILTER_VALIDATE_URL) || parse_url($value, PHP_URL_SCHEME) !== 'https'
        || parse_url($value, PHP_URL_USER) !== null || parse_url($value, PHP_URL_PASS) !== null)) {
        throw new AuthError('Informe um link HTTPS válido.', 422);
    }
    return $value;
}

function catalogImageDirectory(): string {
    $run = getenv('NIGHTOUT_TEST_RUN');
    if ($run && !preg_match('/^[a-f0-9]{16}$/D', $run)) throw new RuntimeException('Invalid test run.');
    return dirname(__DIR__) . '/storage/catalog-images' . ($run ? '-test-' . $run : '');
}

function saveCatalog(PDO $db, array $input, int $userId): array {
    $id = catalogText($input, 'id', 80);
    $new = $id === '';
    if ($new) $id = 'local-' . bin2hex(random_bytes(12));
    if (!preg_match('/^[a-z0-9][a-z0-9-]{0,79}$/D', $id)) throw new AuthError('Identificador inválido.', 422);
    if (!is_bool($input['published'] ?? null)) throw new AuthError('Informe a visibilidade do lugar.', 422);
    $db->beginTransaction();
    $query = $db->prepare('SELECT * FROM venues WHERE id=? FOR UPDATE');
    $query->execute([$id]);
    $row = $query->fetch();
    if (!$new && !$row) throw new AuthError('Lugar não encontrado.', 404);
    if ($row && (!is_int($input['revision'] ?? null) || $input['revision'] !== (int)$row['revision'])) {
        throw new AuthError('Este lugar foi alterado em outra aba. Reabra o registro antes de salvar.', 409);
    }
    $venue = $row ? json_decode($row['document'], true, 64, JSON_THROW_ON_ERROR) : [
        'id' => $id, 'popularTimes' => null, 'liveOccupancy' => null, 'price' => null,
        'occupancy' => null, 'tickets' => false, 'sources' => []];
    foreach (['name'=>150,'address'=>350,'city'=>120,'district'=>120,'accessNote'=>500,'scheduleNote'=>700,'channelLabel'=>80,'imageSource'=>500] as $key => $maximum) {
        $venue[$key] = catalogText($input, $key, $maximum, in_array($key, ['name','address','city'], true));
    }
    $category = inputText($input, 'category');
    if (!in_array($category, ['Bares','Adegas','Casas de festas','Espaços para festas'], true)) throw new AuthError('Categoria inválida.', 422);
    $venue['category'] = $category;
    $venue['weeklyHours'] = catalogHours($input['weeklyHours'] ?? null);
    $venue['appointmentHours'] = catalogHours($input['appointmentHours'] ?? null);
    foreach (['mapsUrl','officialUrl'] as $key) $venue[$key] = catalogUrl(catalogText($input, $key, 2000));
    $point = $input['coordinates'] ?? null;
    if ($point !== null && (!is_array($point) || !is_numeric($point['latitude'] ?? null) || !is_numeric($point['longitude'] ?? null)
        || !is_finite((float)$point['latitude']) || !is_finite((float)$point['longitude'])
        || abs((float)$point['latitude']) > 90 || abs((float)$point['longitude']) > 180)) throw new AuthError('Coordenadas inválidas.', 422);
    $venue['coordinates'] = $point === null ? null : ['latitude'=>(float)$point['latitude'],'longitude'=>(float)$point['longitude']];
    $venue['referenceDistanceKm'] = $point === null ? null : catalogReferenceDistance($venue['coordinates']);
    $photo = $input['photo'] ?? null;
    if ($photo !== null) {
        if (!is_array($photo) || !preg_match('#^/media/venues/([a-f0-9]{32})\.webp$#D', $photo['image'] ?? '', $match)
            || !is_file(catalogImageDirectory() . '/' . $match[1] . '.webp')) throw new AuthError('Foto inválida. Envie pelo painel.', 422);
        $info = getimagesize(catalogImageDirectory() . '/' . $match[1] . '.webp');
        $venue['image'] = $photo['image'];
        $venue['imageCard'] = '/media/venues/' . $match[1] . '-card.webp';
        $venue['imageWidth'] = $info[0]; $venue['imageHeight'] = $info[1];
    }
    if (($input['removePhoto'] ?? false) === true) foreach (['image','imageCard','imageWidth','imageHeight','imageSource'] as $key) unset($venue[$key]);
    // Preserve researched popular times, source history and other fields outside this first editor.
    $venue['editedAt'] = gmdate('c');
    $json = json_encode($venue, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    if ($row) {
        $db->prepare('UPDATE venues SET document=?, published=?, revision=revision+1, updated_by=? WHERE id=?')
            ->execute([$json, (int)$input['published'], $userId, $id]);
    } else {
        $order = (int)$db->query('SELECT COALESCE(MAX(sort_order),0)+1 FROM venues')->fetchColumn();
        $db->prepare('INSERT INTO venues (id, document, published, sort_order, updated_by) VALUES (?, ?, ?, ?, ?)')
            ->execute([$id, $json, (int)$input['published'], $order, $userId]);
    }
    $query->execute([$id]);
    $record = catalogRecord($query->fetch(), true);
    $db->commit();
    return $record;
}

function catalogReferenceDistance(array $point): float {
    $lat = deg2rad($point['latitude'] + 23.66145); $lng = deg2rad($point['longitude'] + 46.55402);
    $a = sin($lat/2)**2 + cos(deg2rad(-23.66145))*cos(deg2rad($point['latitude']))*sin($lng/2)**2;
    return round(6371 * 2 * atan2(sqrt($a), sqrt(max(0,1-$a))), 3);
}

function uploadCatalogPhoto(): array {
    if (!function_exists('imagecreatefromstring')) throw new AuthError('Ative a extensão GD do PHP para enviar fotos.', 503);
    $file = $_FILES['photo'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) throw new AuthError('Envie uma foto válida.', 422);
    if ($file['size'] > 5 * 1024 * 1024) throw new AuthError('A foto deve ter até 5 MB.', 413);
    $info = @getimagesize($file['tmp_name']);
    if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)
        || $info[0] < 1 || $info[1] < 1 || $info[0]*$info[1] > 12000000) throw new AuthError('Use JPG, PNG ou WebP com até 12 megapixels.', 422);
    $source = @imagecreatefromstring(file_get_contents($file['tmp_name']));
    if (!$source) throw new AuthError('Não foi possível ler a imagem.', 422);
    $directory = catalogImageDirectory();
    if (!is_dir($directory) && !mkdir($directory, 0700, true)) throw new RuntimeException('Image directory unavailable.');
    $id = bin2hex(random_bytes(16));
    try {
        foreach ([''=>1200, '-card'=>600] as $suffix => $maximum) {
            $scale = min(1, $maximum/$info[0], $maximum/$info[1]);
            $target = imagecreatetruecolor(max(1,(int)round($info[0]*$scale)),max(1,(int)round($info[1]*$scale)));
            imagealphablending($target, false); imagesavealpha($target, true);
            imagecopyresampled($target, $source, 0,0,0,0,imagesx($target),imagesy($target),$info[0],$info[1]);
            if (!imagewebp($target, $directory . '/' . $id . $suffix . '.webp', 82)) throw new RuntimeException('Image write failed.');
            imagedestroy($target);
        }
    } finally { imagedestroy($source); }
    return ['image'=>'/media/venues/' . $id . '.webp'];
}

function handleCatalog(PDO $db, string $path): never {
    if ($path === '/api/v1/venues') {
        $rows = $db->query('SELECT * FROM venues WHERE published=1 ORDER BY sort_order, id')->fetchAll();
        respond(['venues'=>array_map(fn($row)=>catalogRecord($row), $rows)]);
    }
    startAuthSession();
    $user = requireAdmin($db);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rows = $db->query('SELECT * FROM venues ORDER BY sort_order, id')->fetchAll();
        respond(['records'=>array_map(fn($row)=>catalogRecord($row,true), $rows),'csrf'=>$_SESSION['csrf']]);
    }
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) throw new AuthError('Sua sessão mudou. Entre novamente.',403);
    authLimit($db, 'catalog-write', 120, (string)$user['id']);
    if ($path === '/api/v1/admin/venues/photo') respond(uploadCatalogPhoto(),201);
    respond(['record'=>saveCatalog($db, readAuthInput(), (int)$user['id'])]);
}
