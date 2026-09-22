<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0" />
  <title>@yield('title', 'Priyank | Web Developer & AI Engineer')</title>
  <meta name="description" content="Priyank's portfolio for modern web development, AI engineering, Laravel applications, interactive frontend work, selected projects, and collaboration." />
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@300;400;500;600&family=Orbitron:wght@500;600;700;800;900&display=swap" rel="stylesheet">

  @vite(['resources/css/portfolio.css', 'resources/js/portfolio.js'])
</head>
<body>

  @include('partials.loading')
  @include('partials.webgl')

  @include('partials.nav')

  <main id="main-content" class="site-main" role="main">
    @yield('content')
  </main>

  @include('partials.footer')

</body>
</html>
