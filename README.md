<p align="center"><img alt="Nuxt" align="center" style="width: 200px;" src="./src/public/favicon.png"/></p><br/>

<h1 align="center">📷 Pi Camera</h1>

## Quick start
#### Build frontend
```sh
yarn install
yarn build
```

#### Nginx configuration
```ini
server {
	listen 8888;
	server_name live.yunyuyuan.net _live.yunyuyuan.net;
	error_page  497 https://$host:8888$request_uri;

	set $dist_url ":8888/web/";

	if ($host ~ ^live) {
	    set $dist_url "/web/";
	}

	location = / {
	    return 302 https://$host$dist_url;
	}
	location = /web {
	    return 302 https://$host$dist_url;
	}

	location / {
		proxy_pass http://127.0.0.1:8099/;
	}

	location ~ ^/web {
		root /home/pi/codes/pi-monitor/dist/;
	}

	location /ws {
		proxy_pass http://127.0.0.1:8099;
		proxy_http_version 1.1;
		proxy_buffering off;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "Upgrade";
	}
}
```
  
## Credits
#### backend
* [picamera](https://picamera.readthedocs.io/)
* [RPi.GPIO](https://pypi.org/project/RPi.GPIO/)
* [fastapi](https://fastapi.tiangolo.com/)
#### frontend
* [react](https://reactjs.org/)
* [vite](https://vitejs.dev/)
