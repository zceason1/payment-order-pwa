# 产品货款单 PWA

这是一个可部署到 GitHub Pages 的静态网页工具，用于录入产品货款明细并导出真实 `.xlsx` 文件。

## 本地使用

```bash
npm test
npm run serve
```

打开：

```text
http://localhost:4173
```

## GitHub Pages 部署

1. 在 GitHub 新建公开仓库，例如 `payment-order-pwa`。
2. 上传本目录所有文件。
3. 进入仓库 `Settings -> Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。
6. 保存后等待部署完成。

访问地址通常是：

```text
https://你的用户名.github.io/payment-order-pwa/
```

## iPhone 使用

1. 用 Safari 打开 GitHub Pages 地址。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。
4. 后续从桌面图标进入。

如果在微信里打开，导出 Excel 可能受限制。建议从微信右上角菜单选择“在 Safari 中打开”。

## 成本

使用公开仓库部署到 GitHub Pages 时，托管成本为 0 元。默认 `github.io` 地址免费；只有购买自定义域名时才会产生域名费用。
