sls invoke local --function func #function name from serverless.yml
                 --path <path-to-json-event> #event to send to the function
                 --contextPath <path-to-json-context>
#path event / context inline (Alternatively provide both path and context inline)
--event '{"key":"value"}'
--context '{"key":"value"}'