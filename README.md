(All code & content are [MIT](https://opensource.org/licenses/MIT) licensed.)

**cloud-stater** is a code blueprint to build highly scalable big application with the minimum complexity. This architecture and best practices are part of BriteSnow's **Big App, Small Team** approach. 

- [Approach](#Approach)
- [Code Structure](#Code-Structure)
- [Architecture](doc/arch.md) Top down architecture, overall code structure. 
- **Code Design**
  - [Request Flow](doc/request-flow.md) Web application request flow, with authentication, authorization, and data layer. 
  - [UI](doc/ui.md) Native Web UI Application Component Model, approach, code structured, and best practices.
  - [Error Handling](doc/error.md) Simple, safe, and scalable way to handle exception/error in JS/TS.
- **Best Practices**
  - [Comments](doc/comments.md) Short conventions and best practices about commenting.
  - [TypeScript](doc/typescrip.md) Best practices
  - [Postgresql](doc/postgres.md) Best practices
  - [Css](doc/css.md) Css/PostCSS best practices, technics, and links.
  - [Css](doc/css.md) Css/PostCSS best practices, technics, and links.
- **DevOps**
  - [build](doc/build.md) Build flow and documentation.
  - [Dev](doc/dev.md) Kubernetes centric development workflow and technics.
  - [Test](doc/test.md) Test setup, running, best practices, technics, and links.
  - [kubectl](doc/kubectl.md) useful commands in the context of this architecture.

## Approach

- **Kubernetes Driven Development (KDD)**: Kubernetes is a transformative technology for building cloud application, and this architecture adopts a **Kubernetes development centric approach** which allows maximizing normalization between all of the runtime environments, such as development, test, stages, and production. 

- **Node.js / TypeScript as the main runtime/language**: Between Google dedication to make V8 the best in class javascript runtime for backend services, Node.js/npm ecosystem maturity (i.e., libraries volume and quality), and TypeScript/VSCode high productivity, the Node.js/Typescript has graduated to become one the highest backend and frontend development environment for building robust and scalable backend services. Consequently, to avoid unnecessary technology/languages/framework proliferation, with all of the complexity and social engineering challenge that comes with it, **Node.js with TypeScript** is the **main language** of choice for most if not all backend and frontend services.
    > Note: **[Rust](https://rust-lang.org/)** will be used for micro-services that are better implemented in a GC less runtime (i.e. when Zero-Cost abstraction is necessary), and **Python** for the **Deep Learning** scripting language. 

- **Event-based architecture from the start**: Thanks to Kubernetes and docker, multi-service architectures have never been as frictionless to develop, test, and deploy, allowing new projects to adopt highly scalable message-based architecture from the start. This architecture recommends the use of Redis for the pub/sub/bus capabilities, as it is a proven, robust, and high-performing infrastructure service that is completely portable between local dev, test, stage, and production. 

- **Rust**: As of now, cloud-starter does not have any services implemented in Rust, but this will be coming soon. Rust is a unique language that provides memory safety at zero-abstraction cost which is a perfect fit for big to very small services. The only challenge is that Rust is a language that needs to be learned, but once learned, productivity dramatically increase as well as quality and code robustness. In other words, #LeanWhatMatters and #RustMatters. (**kdd** command line has been re-written in Rust from the original **vdev** nodejs implementation)

See [Architecture](doc/arch.md) for more information on the architecture and technology stack.

## Code Structure

This blueprint is based on a "single-repo" approach where all of the services are based on the same repository and can be built as a whole or individually. 

The key code structure is as follow: 

- **k8s/**: This is where the Kubernetes resource files reside. They are organized by *realms* (more on that later) that are destined to be deployed on a local or remote environment. (more on **realms** later). 

- **scripts/** files are just the build files for the various "DevOps" operations, such as building, REPL watch, and other custom scripts. 

- **services/** base folder contains all of the backend services of the system as well as common resources. For example, `services/web-server` is the node js web API and application service, and `services/agent` is the agent micro-service that manages some DevOps operations during dev/staging/deployment. 

- **frontends/** is the base folder that contains all of the various client frontends. There is usually a 1-1 mapping between the back-end server (in the `services/**` folder) with a `frontends/**` html/ts/css source for web applications.  During the build process, each front-end distribution file (e.g., `app-bundle.js`) will be written into the corresponding server. For example, the `frontends/web/**` bundle files, such as `app-bundle.js`), will be copied in the web application folder `services/web-server/web-folder/` directory.

- **kdd.yaml** is the description file of all of the various resources that need to be built and deployed. It just streamline docker, kubernetes, and allow custom build executors to integrate with rollup, pcss, typescript, and any other compilers.


## Key Tech Stack

For more information, see [Architecture - Tech Stack](doc/arch.md#TechStack)

- **Kubernetes:** For Dev, Test, and Prod.
- **Main Docker OS:** `Debian-Buster-Slim`
- **Main Backend Runtime/Language:** `Node.js / TypeScript` (robust and mature runtime and ecosystem, highly typed and expressive language)
- **Secondary Backend Runtime/Language:**
  - `Rust` When GC based language not appropriate (should be an exception). 
  - `Python` For Machine Learning model scripting.
- **Database:** `Postgresql` (robust, mature, advanced, with no-sql capability with jsonb)
- **Web:** `TypeScript`, `PostCss`, [Rollup](https://www.npmjs.com/package/rollup) ([dom-native](https://github.com/dom-native/dom-native) Dom Centric MVC. simple scale better, used right the DOM is a solid foundation for building large application UIs))
- **IDE:** `VSCode` (best in class productivity with **TypeScript**, robust, fast, extensible with an amazing community). 


## Dev process

### Local Dev Requirements

The development environment has been tested on Mac, but it should work on Windows as well. 

- Install **Docker** for Mac **with Kubernetes** (Windows system with Docker for Windows with Kubernetes will be supported later)
- Install [Node.js](https://nodejs.org/) (the latest 16.x release recommended)
- Install [kdd](https://crates.io/crates/kdd) (simple kubernetes/docker build utility)
- Run a local docker registry with (for the Kubernetes local dev)

```sh
docker run -d -p 5000:5000 --restart=unless-stopped --name registry registry
```
> Note: On Mac Monterey, AirPlay (proc: ControlCe) is using 5000. Must be turned off. System > Sharing checkout off AirPlay https://developer.apple.com/forums/thread/682332
> Needs to send port

### Build, run, and code

- `npm install` (only needed at the root)
- `kdd dbuild` (this build all of the needed docker images, and push then to the local registry)
- `kdd kapply` (doing a kubectl for all default configuration k8s files for the current realm). 
- `npm run recreateDb` (this will call the `agent` microservice to create the db. In prod, the `agent` service is used to make drop sql snapshots, db update and other devops related scripts). 

Now, you should be able to go to http://localhost:8080/ and login as **admin** / **welcome**

- `npm run watch` live dev (REPL)

#### Tips
We usually add the following aliases to the home `~/.profile` to shorten frequent commands on Unixy systems.

```sh
alias k="kubectl" 
alias n="npm run" 
```

## tested

More [developer workflow](doc/dev.md)

## Clean

- `kdelete kdelete` (this will delete all of the Kubernetes resources)

