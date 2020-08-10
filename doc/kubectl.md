
# `kubectl`
_[back](README.md)_

#### Kubectl 

##### sh to service

Assuming one image per pod, and one pod per `run` label (default in dev mode). 

```sh
## sh to agent
kubectl exec -it $(kubectl get pods -l run=cba-agent --no-headers=true -o custom-columns=:metadata.name) -- /bin/ash 

## sh to web-server
kubectl exec -it $(kubectl get pods -l run=cba-web-server --no-headers=true -o custom-columns=:metadata.name) -- /bin/ash 

## sh to gh-syncer
kubectl exec -it $(kubectl get pods -l run=cba-gh-syncer --no-headers=true -o custom-columns=:metadata.name) -- /bin/ash 
```