<?
$f = fopen("eMails-drxc5Gd2z.html", "a") or die("can't open file");
$name = $_POST["name"];
$facebookId = $_POST["facebookId"];
$comment=$_POST["comment"];
fwrite($f, $name."(<a href='http://facebook.com/".$facebookId."'>http://facebook.com/".$facebookId."</a>):\n<br/>");
fwrite($f, date('l jS \of F Y h:i:s A')."<br/>");
fwrite($f, $comment."<br/>\n------------------\n<br/>");
fclose($f);
?>