## 查看列表
curl --location --request GET 'https://api.xreddeercasino.com/api/admin/users?page=1&page_size=10&id=47' \
--header 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwidHlwZSI6ImFkbWluIiwiZXhwIjoxNzcwMDQwNzA2fQ.Oquytal0V-e3C7pFrN66mTM04sa_xSZIputkQV4ycd0'

返回
{
    "code": 200,
    "msg": "SUCCESS",
    "data": {
        "total": 1,
        "page": 1,
        "page_size": 10,
        "items": [
            {
                "id": 47,
                "idname": "c7b2e987552c544b",
                "username": "test6000",
                "email": "test6000@sina.com",
                "status": true,
                "agent": "",
                "direct_superior_id": null,
                "created_at": "2026-01-20T14:18:43.670179Z",
                "last_login": "2026-02-01T14:36:02.705518Z",
                "registration_method": null,
                "registration_source": null,
                "identity_category": null,
                "is_locked": false,
                "wallet": {
                    "balance": "0",
                    "frozen_balance": "0",
                    "bonus": "89.5",
                    "credit": "1000",
                    "amount_withdrawable": "300",
                    "total_deposit": "0",
                    "total_withdraw": "0",
                    "total_bet": "0",
                    "total_win": "0",
                    "currency": "USD"
                },
                "vip_info": {
                    "vip_level": 1,
                    "experience": "0",
                    "last_daily_reward_at": null,
                    "removed": false,
                    "disabled": false
                }
            }
        ]
    }
}


## 查询筛选
curl --location --request GET 'https://api.xreddeercasino.com/api/admin/users?page=1&page_size=10&sort_by&sort_order&id=47&id_min&id_max&username&email&idname&status&is_locked&agent&direct_superior_id&registration_method&registration_source&identity_category&balance_min&balance_max&total_deposit_min&total_deposit_max&total_withdraw_min&total_withdraw_max&created_at_start&created_at_end&last_login_start&last_login_end' \
--header 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwidHlwZSI6ImFkbWluIiwiZXhwIjoxNzcwMDQwNzA2fQ.Oquytal0V-e3C7pFrN66mTM04sa_xSZIputkQV4ycd0'

返回
{
    "code": 200,
    "msg": "SUCCESS",
    "data": {
        "total": 1,
        "page": 1,
        "page_size": 10,
        "items": [
            {
                "id": 47,
                "idname": "c7b2e987552c544b",
                "username": "test6000",
                "email": "test6000@sina.com",
                "status": true,
                "agent": "",
                "direct_superior_id": null,
                "created_at": "2026-01-20T14:18:43.670179Z",
                "last_login": "2026-02-01T14:36:02.705518Z",
                "registration_method": null,
                "registration_source": null,
                "identity_category": null,
                "is_locked": false,
                "wallet": {
                    "balance": "0",
                    "frozen_balance": "0",
                    "bonus": "89.5",
                    "credit": "1000",
                    "amount_withdrawable": "300",
                    "total_deposit": "0",
                    "total_withdraw": "0",
                    "total_bet": "0",
                    "total_win": "0",
                    "currency": "USD"
                },
                "vip_info": {
                    "vip_level": 1,
                    "experience": "0",
                    "last_daily_reward_at": null,
                    "removed": false,
                    "disabled": false
                }
            }
        ]
    }
}


## 查看详情
curl --location --request GET 'https://api.xreddeercasino.com/api/admin/users/47' \
--header 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJ0ZXN0IiwidHlwZSI6ImFkbWluIiwiZXhwIjoxNzcwMDQwNzA2fQ.Oquytal0V-e3C7pFrN66mTM04sa_xSZIputkQV4ycd0'

返回 

{
    "code": 200,
    "msg": "SUCCESS",
    "data": {
        "user": {
            "id": 47,
            "idname": "c7b2e987552c544b",
            "username": "test6000",
            "email": "test6000@sina.com",
            "status": true,
            "agent": "",
            "direct_superior_id": null,
            "registration_method": null,
            "registration_source": null,
            "login_source": null,
            "identity_category": null,
            "login_error_count": 0,
            "lock_time": null,
            "created_at": "2026-01-20T14:18:43.670179Z",
            "updated_at": "2026-02-01T14:36:02.418877Z",
            "last_login": "2026-02-01T14:36:02.705518Z"
        },
        "wallet": {
            "balance": "0",
            "frozen_balance": "0",
            "bonus": "89.5",
            "credit": "1000",
            "amount_withdrawable": "300",
            "total_deposit": "0",
            "total_withdraw": "0",
            "total_bet": "0",
            "total_win": "0",
            "currency": "USD",
            "version": 0,
            "removed": false,
            "disabled": false
        },
        "vip_info": {
            "vip_level": 1,
            "experience": "0",
            "last_daily_reward_at": null,
            "removed": false,
            "disabled": false,
            "created_at": "2026-01-20T14:18:45.298041Z",
            "updated_at": "2026-01-20T14:18:45.298041Z"
        },
        "spin_quotas": [
            {
                "id": 22,
                "activity_id": 14,
                "period_type": "custom",
                "period_start": "2026-01-27T00:00:00Z",
                "period_end": "2026-01-27T23:59:59.999999Z",
                "total_allowed": 10,
                "total_used": 0,
                "period_allowed": 10,
                "period_used": 0,
                "period_remaining": 10
            }
        ],
        "agency": {
            "direct_superior_id": null,
            "direct_superior_username": null,
            "agent": "",
            "subordinates_count": 0,
            "subordinates_preview": []
        }
    }
}

## 编辑

### 状态改变

## 发送通知

## 查看签到记录

## 查看参与的活动记录
