
The logging design is as follow: 

- `_common/src/log/*.ts` are the log utilities to use by all services. 
- A log type (e.g., **web_log** **job_log**) are fully typed and have `log_[log_name](logRec: [LogRecType])` provided in the log utilities.
- The log utilities log function is responsible to 
    - print log to the appriopriate stdout
    - save log to local file, and upload it to **log cloud bucket**
- The **log cloud bucket** path name format is: 
    - `/root_dir/[service_name]/[log_name]/YYYY/raws/YYYY-MM-DD/[service-name]-[log_name]-YYYY-MM-DD-HH-mm-sss-[pod_host_name]-_drop-[drop-version]_.csv.gz`
    - file name example: `web-server-web_log-2022-03-11-17-10-27-201-cstar-web-server-dep-7f6d54665-fkdnd-_drop-005_.csv.gz`

