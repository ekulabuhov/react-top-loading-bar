# react-top-loading-bar

## Install
```bash
npm i https://github.com/ekulabuhov/react-top-loading-bar
```

## Use it with axios
```js
// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";

function App() {
  const [loading, setLoading] = useState(0);
  
  useEffect(() => {
    // Add a request interceptor
    axios.interceptors.request.use(
      config => {
        setLoading(prevValue => prevValue + 1);
        return config;
      },
      function(error) {
        return Promise.reject(error);
      }
    );

    // Add a response interceptor
    axios.interceptors.response.use(
      response => {
        setLoading(prevValue => Math.max(0, prevValue - 1));
        return response;
      },
      function(error) {
        setLoading(prevValue => Math.max(0, prevValue - 1));
        return Promise.reject(error);
      }
    );
  }, []);
  
  return (
    <div>
      <LoadingBar loading={loading} />
    </div>
  )
}
```
