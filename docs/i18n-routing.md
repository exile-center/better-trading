# Routing multilingue

Historiquement avoir des routes multilingues dans une app Ember n’a pas été facile. Plusieurs projets ont adopté des solutions différentes, chaque solution ayant ses désagréments.

Depuis le projet Cominar (Août 2018), nous avons découvert une manière de faire qui permet de faire du routing multilingue sans hack et qui permet d’avoir une flexibilité complète quant à la structure d’URL.

## Une introduction aux `initializers` et `instance-initializers`

La solution se trouve dans les _initializers_, voici donc un bref résumé de leur fonctionnement.

### Qu’est-ce qu’un initializer?

Un _initializer_ est une fonction qui nous permet de retarder le _boot_ de l’application et de le reprendre plus tard. On peut l’utiliser notamment pour charger et/ou éxécuter du code dont l’application aurait besoin pour démarrer correctement.

#### Quelle est la différence avec un instance-initializer?

Un _instance-initializer_ comme son nom l’indique est utilisé pour modifier une instance de l’application.

Le rôle d’une instance tel que décrit par la documentation d’Ember:

> The ApplicationInstance encapsulates all of the stateful aspects of a running Application. At a high-level, we break application boot into two distinct phases:
>
> - Definition time, where all of the classes, templates, and other dependencies are loaded (typically in the browser).
> - Run time, where we begin executing the application once everything has loaded.
>
> Definition time can be expensive and only needs to happen once since it is an idempotent operation. For example, between test runs and FastBoot requests, the application stays the same. It is only the state that we want to reset.
>
> That state is what the ApplicationInstance manages: it is responsible for creating the container that contains all application state, and disposing of it once the particular test run or FastBoot request has finished.

Bref, un _instance-initializer_ sert à configurer une instance d’application. Celle-ci a déjà été créée avec le code de la phase de définition décrit plus haut. L’_instance-initializer_ ne peut pas retarder le _boot_ de l’app, il est plus plus souvent utilisé pour injecter des dépendances dans les différentes classes de l’application.

### Initializers et routes multilingues

Habituellement c’est le router qui s’occupe de définir les routes. Par contre, lorsqu’on l’utilise normalement, le router les défini dans la phase de définition. Ce qui fait que toutes les instances de l’application reçoivent le même set de route, peu importe la langue dans laquelle elle roule.

La solution est donc de sortir la définition des routes de la phase de définition d’application pour l’amener au runtime. En procédant au runtime chaque instance aura seulement les routes dont elle a besoin, dans la langue qu’elle a besoin.

#### Exemple en 2 étapes:

1. On doit assigner une locale à notre instance, ici on utilise l’URL, on pourrait aussi utiliser la langue du browser ou un cookie

   ```js
   // app/instance-initializers/set-locale.js

   export const initialize = appInstance => {
     const intl = appInstance.lookup('service:intl');
     const location = appInstance.lookup('service:location');

     const isEnglish =
       location.path === '/en' || location.path.startsWith('/en/');
     const locale = isEnglish ? 'en-ca' : 'fr-ca';

     intl.setLocale(locale);
   };

   export default {
     initialize,
     before: 'translated-routes'
   };
   ```

2. On assigne les routes à notre instance avec la langue qu’on a assigné plus haut

   ```js
   // app/instance-initializers/translated-routes.js

   export const initialize = instance => {
     const intl = instance.lookup('service:intl');
     const Router = instance.router.constructor;

     Router.map(function() {
       this.route('hello', {path: intl.t('routes.hello')});
     });
   };

   export default {
     initialize
   };
   ```

### Conclusion

On a maintenant des routes multilingues qui fonctionnent sans avoir de dossier `/fr` et `/en`, sans avoir besoin de component `localized-link-to`, sans addon qui copie notre app en 2 versions. Bref, le reste de l’application reste du idiomatic Ember! 🎉
