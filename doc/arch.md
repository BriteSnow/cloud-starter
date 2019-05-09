# Architecture

## Reference Architecture

Here is a modern multi-service reference-architecture recommended for building portable and **scalable** (users & features) cloud applications. 

> Note: This architecture is designed for new application that are destined to scale user and feature wise, while keeping the managed complexity low and avoiding accidental complexity as much as possible (i.e. **Big App, Small Team** Architecture).

![](images/cs-architecture.png)

From bottom to top:

1) **Cloud Platform** At the very bottom this architecture a robust, mature cloud platform, such as Amazon Web Service, Google Cloud Platform, Microsoft Azure, or mature on-premise cloud infrastructure. 

2) **Kubernetes** This modern architecture use the Kubernetes service as the portable "cloud runtime" which will even be heavily used in local/REPL development mode. All the system and application services will be run and managed by Kubernetes. 

3) **Queue & Message Bus** This architecture is heavily designed with a queue/message bus from service to service communication from the start (v.s. as an afterthought). By default Redis, which provides full portability (multi-cloud & local dev) as well a robust and mature pub/sub API constructs, will be used as is. 
    > Note that redis will NOT (and usually, should not) be used as a persistent store in this architecture. The same instance can be used as cache in early releases, which can then be split in its own redis service as performance requires

4) **Back-End Services** The first set of services are backend services that do not have any front-end interface. Could be an image processing service, google data importer or exporter, or any logic that requires to be scaled and managed independently than the main front-end services (.e.g., jobs)
    - **Agent** As a best practice, 'agent' is a 'singleton' service in the Kubernetes application environment to perform all devops/cdci operations.
    - **Service x** All other services can scale horizontally and should have one main job. They are all cordinated via the message bus, with the redis list `_service_name_.queue` (command queue) and will popuplate the `_service_name_.done` with the job done status.

5) **Front-End Services** are services that interface the system application to an external system which could be end-user UI application such as web or mobile application or other web services that would access the system via api. 

6) **Cloud Specific Services** While being 100% cloud portable is appealing and can be mostly achieved, leveraging cloud services can provide great value to an application. Services like CDN/MediaService, Cloud Storage (Bucket/Blog storage), big data (e.g., Big Query) will add great scalability characteristics to an application and should be integrated in any cloud architecture. 
    > Services like databases that could be run as a Kubernetes service in some context (e.g., Dev and Stage) might be used as a cloud service (.e.g., cloud SQL on google or RDS on AWS) in a production environment. Kubernetes end-point support allows to nicely abstract this access to other services, making this choice just a deployment configuration. 



## Tech Stack

One of the key aspects of the **Big App, Small Team** approach is to limit tech proliferation to what is strictly necessary. The approach is to choose a set of **Main Technology** that will be used **90%** of the time, and carve out some excpetion when the requirements really calls for it. This limit the number of languages, runtime, frameworks dramatacally which in turn streamline development and deployment significantly. 

Here is an example of some **Tech Decisions** that we usually make for our cloud applications. Other conclusion might be reached depending of tech lead / team background and preference, but the most important point is to follow to select **ONE** main technology that will be used **90%** and treat the other cases as exceptions that must have a good reasons to not use the main technology pick.  


- **Container**
  - **Main:** `Docker/Alpine-Linux`
      - Lightweight, well supported OS for most Docker images. 
  - **Exceptions** (as needed):
    - **Debian/Strecth** for some specific services (e.g., default linux dist for Rust)
    - **Ubuntu** for machine learning task.

- **Runtime/Language**

  - **Main:** (90%) `Node/Typescript`
    > **Runtime**: NodeJs/V8 is a mature, battle-tested, scalable, and highly-concurrent runtime. Google V8 team has fully embraced nodeJS as one of its key use case for the V8 Runtime, making it one of the best enterprises supported runtime in the market.

    > **Ecosystem**: NodeJS npm package repository is not only the biggest but has also matured extremely well over the year, with high-quality top libraries that sometimes are better maintained than their Java counterpart (e.g., image processing / OpenCV binding and google bucket access). Also, npm continue to innovate agressively, for example, by bringing an integrated security auditing capabilities to their repositories for all libraries (this is HUGE for security).

    > **Productivity**: On top of npm library ecosystem maturity, **TypeScript** brings one of the most modern and expressive typing system to date to modern JavaScript (>es2018), which combined with best in class IDE, such as **VSCode**, brings the one of the highest, if not the highest, productivity environment for developers to build backend and front-end code base. Also, the fact that TypeScript can be used for web front-end as well as backend logic gives a unique productivity advantage. 

    > **Performance**: While JavaScript is single threaded, its backend runtime, Node.js, is highly concurrent in anture, and Node.js non blocking defacto concurrency model from the start combined with the async/await model, make Node.js one of the simplest yet powerful way for high concurrency logic. NodeJs also added worker thread to its latest runtime, which came to an optimization to its current clustering capabilities.

  - **Exceptions:** (5%)
    - **High Performance:**: `Rust` When low-level CPU/Memory optimization is needed (e.g., custom big-binary file processing)
    - **Machine Learning**: `CPython/Python` Which is for better or worse the langa franca of Machine Learning scripting language. 


One of the advantage of **Mono-Language** approach (accross micro service, backend service, and even front-end) is that it not only allows to share logic code, but more importantly share time between all of the end-points avoiding the need to added cross language 'meta' typing systems, such as [ProtoBuf](https://developers.google.com/protocol-buffers/) and [Apache Thrift](https://thrift.apache.org/). Those system can still be used for when one end of the communication channel is an exception or for some very specific performance need. 

