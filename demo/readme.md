## 说明
本文件夹下的每个子文件夹，对应`dynamic-mocker`的一种用法。

### mock_proxy
命令：`npm run mock`
- 根据配置文件启动一个服务 `http://localhost:8037` 模拟后端服务供前端接口调用。
- 根据接口路径对应到`root`文件夹下的数据模拟文件。
- 若数据模拟文件不存在或数据已经`disabled`，那么根据proxyTarget配置，反向代理到实际的后端服务接口上。
- 配置文件和数据模拟文件修改后立即生效。可随时通过`disabled`属性，对某个接口切换mock数据和真实数据。
- 此用法可参考[这个例子](https://github.com/hzsrc/dynamic-mocker-sample)

### proxy
命令：`npm run proxy80`(win) or `sudo npm run proxy80`(linux,mac)
- 代理转向。将一个服务地址代理到另一个服务地址。比如代理到80或443端口，结合系统hosts配置，模拟用域名访问本地。
- 本例为 `https://localhost` 的请求代理到 将上述`mock_proxy`的服务`http://localhost:8037`

### client_preview
命令：`npm run dev`
- 将数据模拟打包发布到前端项目中，用于发布后使用mock数据预览页面功能和效果。
- 通过拦截XMLHttpRequest的调用，实现所有ajax数据模拟。对于未作模拟的接口，仍然走实际的网络接口调用。
- 可运行`npm run mock-gen`自动生成`mockClient.js`，其中包含了所有的mock数据。然后在前端代码中引入这个js文件，即可在ajax调用时拦截并模拟接口数据。
- 结合js条件编译，可以按条件引入`mockClient.js`。参考[这个例子](https://github.com/hzsrc/vue-element-ui-scaffold-webpack4/blob/master/src/pages/main.js)

### static_svc
命令：`npm run static`
- 以`root`文件夹为根目录，启动一个http服务。
- 可用于构建后生成的`dist`目录的预览，而不需要将`dist`发布到服务器。
