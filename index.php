<?php
    //good one!
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Yuki-chan!</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Tương tác với Yuki-chan, người bạn AI tương tác của bạn được cung cấp bởi Live2D và Gemini AI. Trải nghiệm trò chuyện, biểu cảm và tương tác động trong thời gian thực.">
    <meta name="keywords" content="Yuki-chan, bạn đồng hành AI, Live2D, Gemini AI, trò chuyện tương tác, trợ lý ảo">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Etheriaa">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://yuki.auroramusicvietnam.net/">
    <meta property="og:title" content="Yuki-chan! Người bạn AI Live2D của bạn">
    <meta property="og:description" content="Tương tác với Yuki-chan, người bạn AI tương tác của bạn được cung cấp bởi Live2D và Gemini AI. Trải nghiệm trò chuyện, biểu cảm và tương tác động trong thời gian thực.">
    <meta property="og:image" content="https://yuki.auroramusicvietnam.net/assets/favicon.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://yuki.auroramusicvietnam.net/">
    <meta property="twitter:title" content="Yuki-chan! Người bạn AI Live2D của bạn">
    <meta property="twitter:description" content="Tương tác với Yuki-chan, người bạn AI tương tác của bạn được cung cấp bởi Live2D và Gemini AI. Trải nghiệm trò chuyện, biểu cảm và tương tác động trong thời gian thực.">
    <meta property="twitter:image" content="https://yuki.auroramusicvietnam.net/assets/favicon.png">
    
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="assets/favicon.png" type="image/x-icon">

    <script src="https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pixi.js@6.5.2/dist/browser/pixi.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/index.min.js"></script>
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
</head>

<body>
    <div id="loading-overlay">
        <img src="assets/loading.gif" alt="Loading..." class="loading-gif">
        <div id="loading-text" class="loading-text">Initializing...</div>
        <div class="progress-bar-container">
            <div id="progress-bar" class="progress-bar"></div>
        </div>
    </div>
    <canvas id="canvas" width="100%" height="100%"></canvas>
    <script src="js/index.js"></script>
    <script src="js/session_manager.js"></script>
    <script src="js/chatbox.js"></script>
    <script src="js/sidebar.js"></script>
    <script src="js/spotify.js"></script>
</body>

</html>