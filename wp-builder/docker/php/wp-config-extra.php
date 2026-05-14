<?php

declare(strict_types=1);

if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

$wp_home = getenv('WORDPRESS_HOME');
if (is_string($wp_home) && $wp_home !== '') {
    define('WP_HOME', $wp_home);
    $wp_siteurl = getenv('WORDPRESS_SITEURL');
    define('WP_SITEURL', (is_string($wp_siteurl) && $wp_siteurl !== '') ? $wp_siteurl : $wp_home);
}
