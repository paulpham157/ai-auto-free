# AI Auto Free ( ![GitHub Repo stars](https://img.shields.io/github/stars/ruwiss/ai-auto-free) )


<div align="center">
  <a href="README.md">English</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.cn.md">中文</a>
</div>

<br>

> **注意：** 该程序目前仅支持Windows操作系统。

# [下载最新的](https://github.com/ruwiss/ai-auto-free/releases/latest)

AI Auto Free是一个综合性自动化工具，可以无限制地使用如Cursor和Windsurf等人工智能驱动的IDE。

该工具允许您以经济实惠的方式直接拥有创建的账户。

## 重要警告
该工具仅为研究和教育目的而开发。请负责任地使用。开发者不对使用该工具可能产生的任何问题承担责任。

## 支持的语言

| 语言        |            |            |
|-------------|------------|------------|
| English     | Türkçe     | 中文       |
| Deutsch     | Français   | Português  |
| Русский     |            |            |

## 截图

### Windows
https://github.com/user-attachments/assets/f36417b9-09c5-418f-a461-20d8a411ba40

![Res1](screenshots/r1.png)
![Res1](screenshots/r2.png)
___
### 账户创建器
完全自动化。您无需做任何事情。它通过池（服务器）为您检索先前创建的账户。
___

### 要求
- Python 10及以上版本（推荐最新版本）
- Google Chrome

### Common Issues

- #### Too many free trial accounts
错误：Too many free trial accounts used on this machine.
解决方法：由于您在同一设备上使用了多个Cursor试用账户，因此被检测到。为快速解决此问题，请在终端中运行以下命令：

**Windows 用户：**
```
irm https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_win_id_modifier.ps1 | iex
```

**Mac 用户：**
```
curl -fsSL https://aizaozao.com/accelerate.php/https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_mac_id_modifier.sh -o ./cursor_mac_id_modifier.sh && sudo bash ./cursor_mac_id_modifier.sh && rm ./cursor_mac_id_modifier.sh
```

**Linux 用户：**
```
curl -fsSL https://raw.githubusercontent.com/yuaotian/go-cursor-help/refs/heads/master/scripts/run/cursor_linux_id_modifier.sh | sudo bash
```

- #### Our servers are currently overloaded
错误：Our servers are currently overloaded for non-pro users, and you've used your free quota.
解决方法：当您的账户额度用完时会出现此错误。如果还有额度但仍然收到此错误，可能Cursor服务器对试用账户进行了临时限制。请稍等片刻或尝试退出重新登录。

- #### Unauthorized Request
错误：User is unauthorized.
解决方法：您使用的账户未授权，已被Cursor封禁。

- #### High Load
错误：We're experiencing high demand for Claude 3.7 Sonnet right now.
解决方法：由于使用量大，Cursor暂时对试用账户限制了Claude相关模型。请稍后再试。

- #### Trial Request Limit
错误：You've reached your trial request limit.
解决方法：您的试用账户额度已用完。可通过获取新账户继续使用。

- #### Your request has been blocked as our system
错误：Your request has been blocked as our system has detected suspicious activity from your account/ip address.
解决方法：如果您的账户曾被Cursor封禁，您的IP可能已被列入黑名单。请更换网络IP或使用“Warp”工具：https://one.one.one.one/

- #### Connection Failed
错误：If the problem persists, please check your internet connection or VPN, or email us at hi@cursor.sh.

___
### 常见问题解答
- #### 这个工具做什么？
像Cursor和Windsurf这样帮助我们编码的人工智能驱动的IDE在免费计划中有限制使用。您可以使用此工具来克服这一限制。

获得账户后，您可以通过点击您收到的账户来切换到该账户。这样，您可以使用多个账户。

- #### 如果我创建一个新账户，我的代码或与AI的对话（上下文）会被删除吗？
不会，它们不会被删除。
___
