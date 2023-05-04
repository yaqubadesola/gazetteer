<?php


ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$app_id = '4u8bV9x0wnGrHE3WeWJcm7m60bQT5ggSTikkvuig';
$currencies = $_REQUEST['currencies'];
$url = 'https://api.currencyapi.com/v3/latest?apikey=' . $app_id . '&currencies=' . $currencies;



$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode["data"];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>