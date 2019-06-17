<?php ?>

<!doctype html>
<html lang="en">
    
    <head>
        
        <meta charset="UTF-8">
        
        <title><?= $page -> title() ?></title>
        
        <meta name="viewport" content="width=device-width, initial-scale=1 user-scalable=no">

        <link rel="stylesheet" href="<?= kirby()->urls()->assets() ?>/css/style.css">
        
    </head>

    <body class="page">

        <?= $page -> body() -> kirbytext() ?>

    </body>
    
</html>