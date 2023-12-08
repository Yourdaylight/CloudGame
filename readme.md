## 需要安装的vscode插件进行云开发的
- Azure Resources
- Azure Static Web Apps
- Azure Functions
> 云函数的部署操作参考: https://learn.microsoft.com/en-us/azure/static-web-apps/add-api?tabs=angular#create-the-api
    - 本地测试：` swa start dist/ng_front --api-location api `
- Github Actions

## 文件说明
- Github Actions 配置文件：.github/workflows/azure-static-web-apps-ng_front-2021-10-11T07_44_44_932Z.yml
  当修改文件提交到github时，会自动触发部署到Azure
- Static Web Apps 静态网站部署文件：dist/ng_front
- Azure functions ：front/api
- CosmosDB数据库的连接字符串：`mongodb://games:oQ5bO7YMfpu99oZMpKs0fjjypybyIMwBHJh7TmK8FYj1J41StnByDp1vxZ0huSXxlYbNLiRtNdvZACDb9cByMQ%3D%3D@games.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@games@`