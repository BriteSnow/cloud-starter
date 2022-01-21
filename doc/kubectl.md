_[home](../README.md)_

# `kubectl`

#### Kubectl 

##### sh to service

Assuming one image per pod, and one pod per `run` label (default in dev mode). 

```sh
## sh to cmd-pod
kubectl exec -it $(kubectl get pods -l run=cstar-cmd-pod--no-headers=true -o custom-columns=:metadata.name) -- /bin/ash 

## sh to web-server
kubectl exec -it $(kubectl get pods -l run=cstar-web-server --no-headers=true -o custom-columns=:metadata.name) -- /bin/ash 
```