<?php
if(isset($_POST['score'])){
    file_put_contents("scores.txt", intval($_POST['score'])."\n", FILE_APPEND);
}
?>