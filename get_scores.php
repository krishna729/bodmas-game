<?php
if(file_exists("scores.txt")){
    $scores = file("scores.txt", FILE_IGNORE_NEW_LINES);

    rsort($scores); // highest first

    $rank = 1;
    foreach($scores as $s){
        echo "<li>#".$rank." - ".$s." pts</li>";
        $rank++;
    }
}
?>