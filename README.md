(All code & content are [MIT](https://opensource.org/licenses/MIT) licensed.)

**cloud-starter** is a blueprint code starter for building modern and scalable multi-service based cloud application. 

**NOTE:** The architecture principle and much of the sample codes have been proven and used for real production system, however, the documentation is still in progress. 

Key Documents: [Architecture](doc/arch.md) | [UI Development](doc/ui.md)

## Approach

- **Kubernetes end-to-end approach**: Kubernetes is a transformative technology for building cloud application and this architecture adopt a **Kubernetes development centric approac**h which allows to maximize normalization between all of the runtime environments, such as development, test, stages, and production. 

- **Node.js / TypeScript as the main runtime/language**: Between Google dedication to make V8 the best in class javascript runtime for backend services, Node.js/npm ecosystem maturity (i.e., libaries volume and quality), and TypeScript/VSCode high productivity, the Node.js/Typescript has graduated to become one the highest backend and frontend development environment for building robust and scalable backend services. Consequently, to avoid uncessary technology/languages/framework proliferation, with all of the complexity and social engineering challenge that comes with it, **Node.js with TypeScript** is the **main language** of choice for most if not all backend and frontend services.
    > Note: **[Rust](https://rust-lang.org/)** will be used for micro-services that are better implemented in a GC less runtime (i.e. when Zero-Cost abstraction is necessary), and **Python** for the **Deep Learning** scripting language. 

- **Event-based architecture from the start**: Thanks to Kubernetes and docker, multi-service architectures have never been as friction less to develop, test, and deploy, allowing new project to adopt with highly scalable message based architecture from the start. This architeture recommends the use of Redis for the pub/sub/bus capabilities, as it is a proven, robust, and high-performing infrastructure service that is completely portable between local dev, test, stage, and production. 


See [Architecture](doc/arch.md) for more information on the architecture and technology stack.

## Code Structure

This blueprint is based on a "single-repo" approach where all of the services are based on the same repository and can be built as a whole or individually. 

The key code structure is as follow: 

- **k8s/**: This is where the Kubernetes resource files reside. They are organized by *realms* (more on that later) that are destined to be deployed on a local or remote environment. (more on **realms** later). 

- **scripts/** files are just the build files for the various "DevOps" operations, such as building, REPL watch, and other custom scripts. 

- **services/** base folder contains all of the backend services of the system as well as common resources. For example `services/web-server` is the node js web API and application service, and `services/agent` is the agent micro-service which manage some DevOps operations during dev/staging/deployment. 

- **frontends/** is the base folder that contains all of the various client frontends. For web applications, there is usually a 1-1 mapping between the backend server (in the `services/**` foolder) with a `frontends/**` html/ts/css source.  During the build process each frontend distribution files (e.g., `app-bundle.js`) will get written into the corresponding server. For example, the `frontends/web/**` bundle files, such as `app-bundle.js`), will be copied in the web application folder `services/web-server/web-folder/` directory.

- **vdev.yaml** is the description file of all of the various resources that need to be built and deployed. It read by a simple but effective devops Node.js devops utility **vdev** which used TypeScript/Rollup/PostCSS/Handlebars to process web frontend assets, and typescript / docker to process and package the backend services into docker images. 


## Key Tech Stack

For more information, see [Architecture - Tech Stack](doc/arch.md#TechStack)

- **Main Docker OS:** `Alpine` (small, well supported)
  - `Debian/buster[-slim]` For/When Rust and hopefully ML (`Unbutu` for ML if no choice)
- **Main Backend Runtime/Language:** `Node.js / TypeScript` (see above, mature, robust, scalable, high-productive)
  - `Rust` When GC based language not appropriate (should be an exception). 
  - `Python` For Machine Learning model scripting.
- **Database:** `Postgresql` (robust, mature, advanced, with no-sql capability with jsonb)
- **Web:** `TypeScript`, `PostCss`, `DOM MVC`, [Rollup](https://www.npmjs.com/package/rollup) ([dom-native](https://github.com/dom-native/dom-native) Dom Centric MVC. simple scale better, used right the DOM is a solid foundation for building large application UIs))
- **IDE:** `VSCode` (best in class productivity with **TypeScript**, robust, fast, extensible with an amazing community). 


## Dev process

### Local Dev Requirements

As of now, the development environment has been tested on Mac, but it should work on Windows as well. 

- Install **Docker** for Mac **with Kubernetes** (Windows system with Docker for Windows with Kubernetes will be supported later)
- Run a local docker registry with (for the Kubernetes local dev)

```sh
docker run -d -p 5000:5000 --restart=unless-stopped --name registry registry
```

### Build, run, and code

- `npm install` (only needed at the root)
- `npm run vdev dbuild` (this build all of the needed docker images, and push then to the local registry)
- `npm run vdev kcreate` (this will call the vdev module to create all of the Kuberenetes resources and deploy locally or remotely all Kuberentes resource. Can be used selectively as well as `npm run dev kcreate web-server`, see [vdev](https://github.com/BriteSnow/node-vdev) for more info)
- `npm run recreateDb` (this will call the `agent` microservice to create the db. In prod, the `agent` service is used to make drop sql snapshots, db update and other devops related scripts). 

Now, you should be able to go to http://localhost:8080/ and login as **admin** / **welcome**

- `npm run watch` live dev (REPL) 

#### Tips
On Unixy systems, we usually add the following aliases to the home `~/.profile` to shorten frequent commands.

```sh
alias k="kubectl" # k get pods

alias n="npm run" # n recreateDb
alias v="node ./node_modules/.bin/vdev" # v kcreate
```

## tested

More [developer workflow](doc/dev.md)

## Clean

- `npm run vdev kdelete` (this will delete all of the Kubernetes resources)

