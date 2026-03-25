<?php
if(file_exists("scores.txt")){
    $scores = file("scores.txt", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    $scores = array_filter($scores, 'is_numeric');
    rsort($scores, SORT_NUMERIC);
    $scores = array_slice($scores, 0, 10); // top 10 only

    $medals = [
        1 => '<i class="fa-solid fa-medal" style="color:#f6e05e;"></i>',
        2 => '<i class="fa-solid fa-medal" style="color:#cbd5e0;"></i>',
        3 => '<i class="fa-solid fa-medal" style="color:#dd9b5a;"></i>',
    ];
    $rank = 1;
    foreach($scores as $s){
        $icon = isset($medals[$rank])
            ? $medals[$rank]
            : '<i class="fa-solid fa-ranking-star" style="color:#718096;"></i>';
        echo "<li>".$icon." &nbsp; ".(int)$s." pts</li>";
        $rank++;
    }
}
?>