export default (error: Error | string) => `
<html>
  <head>
    <title>Erreur 500 / Error 500</title>
    <meta charset="utf-8">
  </head>

  <body>Internal Server Error</body>

  <script>console.error('${error}');</script>
</html>
`;
