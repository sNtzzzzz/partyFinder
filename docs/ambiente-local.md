# Rodar o NightOut em outro PC com XAMPP

O projeto já conecta via PHP/PDO ao MariaDB. Instalar XAMPP não traz os usuários do outro computador. O banco precisa ser transferido separadamente.

## Trazer os usuários de casa

1. Em casa, ligue MySQL e Apache no XAMPP e abra `http://localhost/phpmyadmin`.
2. Selecione o banco `nightout`, abra **Exportar** e salve em formato **SQL**, incluindo estrutura e dados de todas as tabelas. Isso inclui os hashes de senha e permite usar as mesmas senhas depois.
3. Transfira o arquivo de forma privada, fora do repositório. Não publique nem faça commit do backup.
4. Neste PC, ligue MySQL e Apache. No phpMyAdmin, crie um banco vazio chamado `nightout`, com collation `utf8mb4_unicode_ci`.
5. Selecione esse banco, abra **Importar**, escolha o SQL e execute. Se já houver dados neste PC, faça backup antes e revise a restauração; não importe por cima sem avaliar conflitos.

Referência: [importação e exportação no phpMyAdmin](https://docs.phpmyadmin.net/en/qa_4_9/import_export.html).

As contas são copiadas, mas as sessões do navegador não: entre novamente. Novos cadastros e alterações posteriores em cada PC permanecem naquele banco, até uma nova transferência planejada.

Se você ainda não tem o backup, pode criar `nightout` vazio e executar as migrations para cadastrar contas de teste. As migrations criam estrutura; não recuperam usuários de casa. Evite misturar esses registros com o backup depois.

## Conexão e execução

O padrão em `backend/config/database.example.php` é `127.0.0.1:3306`, banco `nightout`, usuário `root`, senha vazia. Se a configuração do XAMPP for diferente, copie esse arquivo para `backend/config/local.php` e ajuste os valores. Nunca coloque a senha do banco no JavaScript.

No terminal PowerShell do VS Code, partindo de `Nightout`:

```powershell
cd .\partyFinder
& C:\xampp\php\php.exe .\backend\database\migrate.php
powershell -ExecutionPolicy Bypass -File .\backend\start.ps1
```

Execute as migrations depois de criar/importar o banco. O código atual cria tabelas se ausentes e adiciona colunas se ausentes; não precisa apagar contas para aplicá-las. Esse SQL foi escrito para MariaDB.

Abra `http://127.0.0.1:8000/api/v1/health`; a resposta deve ter `status: ok` e `database: connected`. Depois abra `http://127.0.0.1:8000/` ou `/conta.html`. Mantenha o terminal aberto; `Ctrl+C` encerra o servidor.

MySQL deve ficar ligado. Apache é necessário para acessar o phpMyAdmin; o site roda no servidor embutido do PHP iniciado pelo script. Não precisa mover o projeto para `htdocs`. Live Server ou abrir o HTML diretamente não executam esta API.

Se instalou XAMPP em outra pasta, ajuste o caminho do PHP nos comandos e em `backend/start.ps1`.

## Diagnóstico rápido

- PHP não encontrado: conferir pasta de instalação e caminho em `start.ps1`.
- Unknown database: criar/importar `nightout` antes das migrations.
- Access denied: conferir usuário/senha em `backend/config/local.php`.
- Conexão recusada: conferir MySQL ligado e porta configurada.
- Tabela/coluna ausente: executar migrations e ler o erro no terminal.
- API indisponível: conferir terminal do PHP e endpoint de health; detalhes de conexão ficam no log, não na resposta pública.

## Verificações após preparar o ambiente

Na pasta `partyFinder`:

```powershell
& C:\xampp\php\php.exe .\tests\run-auth.php
node --test --test-isolation=none tests/auth-ui.cjs tests/location.cjs
```

O runner PHP cria e remove seu próprio banco temporário. Não execute `tests/auth.php` diretamente. Para e-mails locais de teste, com o servidor ligado:

```powershell
& C:\xampp\php\php.exe .\backend\mailbox.php
```
