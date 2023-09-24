
# Sms service

Powerful SMS service

Version: **1.2**
## Environment Variables

To run this project, you will need to add the following environment variables to your docker-compose.yml file

`MYSQL_DATABASE`

`MYSQL_ROOT_PASSWORD`

`JWT_SECRET`


## Deployment

To deploy this project run

```bash
# get project from git
  $ cd /path/to/destination/folder
  $ git clone https://github.com/Carterline42/aqua-service-sms.git

# get project from zip
  $ sudo apt-get install unzip
  $ unzip archive.zip -d /path/to/destination/folder

# build and run containers
  $ docker-compose build
  $ docker-compose up -d
```
> __Note__
> | Loading dependencies may take some time


### Reinstall
Just remove all content in **mariadb** folder
> __Warning__
> | DATA WILL BE LOSS!
## API Reference

### Base url for gateway
```http
  http://user:password@example.com/gateway/
```

#### Insert new phone number/allow advices

```http
  PUT /phone/{phone}
```

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `phone` | `integer` | **Required** |

#### Disallow advices for phone number

```http
  DELETE /phone/{phone}
```

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `phone` | `integer` | **Required** |

### Additional way to send requests above

#### Insert new phone number/allow advices

```http
  * /phone/add/{phone}
```

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `phone` | `integer` | **Required** |

#### Disallow advices for phone number

```http
  * /phone/remove/{phone}
```

| Parameter | Type     | Description |
| :-------- | :------- | :---------- |
| `phone` | `integer` | **Required** |


## Base url for api
```http
  http://example.com/api/
```
## Feedback

If you have any feedback, please reach out to us at consulive@live.com

