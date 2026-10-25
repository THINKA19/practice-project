# 会话接口契约

本模块不创建数据库表。现有顾客 profile /user/info、刷新 /auth/refreshToken、注销 /auth/logout 延续原客户端契约；商家、骑手路径由环境配置提供。

profile 必须绑定当前 token 并返回明确 identity；商家/骑手不能省略。单会话互斥是客户端状态策略，后端仍须逐接口校验身份和权限；若要求跨设备全局互斥，需后端会话撤销策略配合。

登录交换 POST，profile GET，refresh POST {refreshToken}，logout GET；具体后端不一致时修改所属 API 适配。不得把 token 放入 URL。门店成员、门店 grant、骑手资格均属于各自权限模块，不写入 session 作为最终授权依据。
