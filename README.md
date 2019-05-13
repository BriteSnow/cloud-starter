(All code & content are [MIT](https://opensource.org/licenses/MIT) licensed.)

**cloud-starter** is a blueprint code starter for building modern and scalable multi-service based cloud application. 

**NOTE:** The architecture principle and much of the sample codes have been proven and used for real production system, however, the documentation is still in progress. 

## Approach

- **Kubernetes**: Kubernetes is a transformative technology for building cloud application and this architecture adopt a Kubernetes development centric approach which allows to maximize normalization between all of the runtime environments, such as development, test, stages, and production. 

- **Node.js / TypeScript**: Between Google dedication to make V8 tue best in class javascript runtime for backend services, the ecosystem maturity (i.e., libaries volume and quality), and TypeScript/VSCode high productivity values, the Node.js/Typescript has graduated to be a high productivity and performance environment for building robust and scalable backend services. Consequently, to avoid uncessary environment proliferation, with all of the complexity that comes with it, **Node.js with TypeScript** is the **main language** of choice for most if not all backend and frontend services.
    > Note: **[Rust](https://rust-lang.org/)** will be used for micro-services that are better implemented in a GC less runtime, and **Python** for the **Deep Learning** scripting language. 

- **Event-based architecture**: Thanks to Kubernetes and docker, multi-service architectures (e.g., microservice architecture) have never been as simple, and this allows to start a new project with highly scalable architecture from the get-go, and that it with a message bus (.e.g., redis power in this case). While message base architecture is not designed to replace SOA architecture entirely, it does make the system much more reliable and extensible by offloading the "main-to-many" service internal dependencies. 

See [Architecture](doc/arch.md) for more information on the architecture and technology stack.

## Key Structure

This blueprint is based on a "single-repo" approach where all of the services are based on the same repository and can be built as a whole or individually. 

The key code structure is as follow: 

- **k8s/**: This is where the Kubernetes resource files reside. They are organized by *realms* (more on that later) that are destined to be deployed on a local or remote environment. (more on **realms** later). 

- **scripts/** files are just the build files for the various "DevOps" operations, such as building, REPL watch, and other custom scripts. 

- **services/** base folder contains each service of the system as well as common resources. For example `services/web-server` is the node js web API and application service, and `services/agent` is the agent micro-service which manage some DevOps operations during deployment. 

- **web/** is the base folder for the web UI source code. During the build process the distribution files (e.g., `app-bundle.js`) will get written in the `services/web-server/web-folder/` directory.

## Key Tech Stack

- Runtimes: Alpine Linux as much as possible, Node.js 10.x services, Redis for the message bus, and Postgres for DB.
- Code: Typescript (latest) for all backend, microservice, as well as UI code. 
- Web
    - CSS: PostCss
    - HTML Templating: Handlebars
    - DOM MVC: MVDOM (Dom Centric MVC ... simple scale better ... used right the DOM is a solid foundation for building large application UIs)

We have standardized our IDE to be VSCode for everything, and while it might not have everything other Ideas, we found that it's tight integration with TypeScript (our language of choice) and its fast innovation has given us a nice productivity boost. 

## Local Dev Requirements

As of now, the development environment has been tested on Mac, but it should work on Windows as well. 

- Install Docker for Mac with Kubernetes
- Run a local docker registry with (for the Kubernetes local dev)

```sh
docker run -d -p 5000:5000 --restart=unless-stopped --name registry registry:2.6.2
```

## Build, run, and code

For github integration support, create a file at `services/agent/sql/03_seed-github-key.sql` (it will be ran by `npm run recreateDb`) (see [dev](doc/dev.md) for more info)

- `npm install`
- `npm run vdev dbuild` (this build all of the needed docker images, and push then to the local registry)
- `npm run vdev kcreate` (this will create all of the Kuberenetes resources)
- `npm run recreateDb` (this will call the `agent` microservice to create the db. In prod, the `agent` service is used to make drop sql snapshots, db update and other devops related scripts). 

Now, you should be able to go to http://localhost:8080/ and login as **admin** / **welcome**

- `npm run watch` live dev (REPL) 

## tested


More [developer workflow](doc/dev.md)

## Clean

- `npm run vdev kdelete` (this will delete all of the Kubernetes resources)

