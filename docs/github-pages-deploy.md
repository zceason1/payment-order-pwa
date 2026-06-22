# GitHub Pages 部署说明

## 费用

使用公开仓库发布到 GitHub Pages 时，托管费用为 0 元。

- 默认 `github.io` 访问地址免费。
- 不需要服务器。
- 不需要数据库。
- 不需要 Apple 开发者账号。
- 只有购买自定义域名时，域名服务商会收取域名费用。

## 部署步骤

1. 登录 GitHub。
2. 新建一个公开仓库，例如 `payment-order-pwa`。
3. 上传本项目目录中的全部文件。
4. 进入仓库 `Settings -> Pages`。
5. `Build and deployment` 选择 `Deploy from a branch`。
6. Branch 选择 `main`，目录选择 `/root`。
7. 保存后等待部署完成。

部署完成后，访问地址通常是：

```text
https://你的用户名.github.io/payment-order-pwa/
```

## Windows 使用

1. 用 Chrome 或 Edge 打开 GitHub Pages 地址。
2. 录入产品、单位、数量、单价。
3. 点击“导出 Excel”。
4. 下载得到 `.xlsx` 文件。

也可以在浏览器地址栏安装为桌面应用。

## iPhone / iPad 使用

1. 用 Safari 打开 GitHub Pages 地址。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。
4. 从桌面图标进入使用。

导出时优先使用 iOS 分享面板，可保存到“文件”，也可转发到微信、邮件、Excel 或 Numbers。

如果从微信内置浏览器打开，导出文件可能受限制。建议点右上角菜单，选择“在 Safari 中打开”。

## 更新版本

修改文件后提交到 `main` 分支，GitHub Pages 会自动发布新版本。

本项目的离线缓存采用“联网优先，离线回退”策略。用户联网打开一次后，会自动拿到新版文件；离线时继续使用上一次缓存的版本。
