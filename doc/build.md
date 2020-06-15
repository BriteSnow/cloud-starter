# Autentication
_[back](README.md)_


## Intro

The build process is orchestrated by the `vdev` scripts and guided by the [vdev.yaml](../vdev.yaml) files. 

[vdev.yaml](../vdev.yaml) has two main sections: 
- `blocks`: Represents what is getting built.
- `realms`: Represents the deployment destitation (i.e., kuberenetes cluster target)

Each `block` match to a base block folder, which is typically under `/services/_block_name_/` for backend services block, or `/frontends/_block_name_` for webBundle type of blocks (.js, .css set of files). Frontends blocks (i.e., webBundle) can be built separately, but are usually dependencies of backend server (e.g., `services/web-server` will depends on `frontends/web` webBundle). 

- Backend Blocks (i.e., `/services/_block_name_/`) are built with the following rules by the vdev scripts.
  - If `package.json` then `npm install` is called.
  - If `tsconfig.json` then typescript compilation is called (with the typescript from root package.json)
  - If `Dockerfile` then `docker build ...` is called.
  - Docker images are tagged with `http://localhost:5000/_system_-_service_name_:_image_tag_` where
    - `_system_` is the `vdev.yaml - system` property (the system prefix in a way)
    - `_service_name_` is usually the name of the folder under `services`
    - `_image_tag_` isuaully the `__version__` (see the Version section below)
  - For example, given the [] the [vdev.yaml](../vdev.yaml) and [package.json](../package.json) tag will be `http://localhost:5000/cstar-web-server-DROP-001-SNAPSHOT`


## Versioning

To have a consistent versioning system across all blocks (backend and frontend), the `package.json` `__version__` property is taken in account and added to the minimum set of files so that each part of the system can have the hardcoded version. 

- docker label - the `__version__` number can be used in the [vdev.yaml](../vdev.yaml) for the image tag, which is a property of `realms`, usually used in the `realms._common` which will be properties shared for all realms.
- Typicaly `package.json` `__version__` is used for versioning, `version` will be set to `0.0.0` to make clear it is not used as a versioning scheme.
  > FAQ 1: why not package.json version field? - The problem with package.json version is that it forces to follow the semver which might be too limiting for "application versioning" scheme. 
- [vdev.yaml](../vdev.yaml) can have a `version.files` which list the list of files where `__version__` variables and `?v=...` (for .html) variable / parameter value will be updated. Typeical files are 
- `npm run vdev version` can be ran to update the versioned files with the new version. `versioning` is also ran before eadh `dbuild`


## Version dipslay

Once the version is included in the various code, it can be siplay



### 

