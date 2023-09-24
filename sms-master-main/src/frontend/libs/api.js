class API
{
    _baseUrl;
    _authentication;
    
    constructor(baseUrl)
    {
        this._baseUrl = baseUrl;
    }

    async checkAvailability()
    {
        let storedAccessToken = localStorage.getItem('csat');
        if (storedAccessToken != null)
        {
            this._authentication = storedAccessToken;
            let result = await this.accountInfo();
            if (result[0] == 200)
            {
                return result[1]['response'];
            }
            else
            {
                localStorage.removeItem('csat');
                this._authentication = null;
            }
        }
        else
        {
            return false;
        }
    }

    async _call(url, method, data = {}, headers = {})
    {
        let dataFormed = new FormData();
        if (Object.keys(data).length > 0)
        {
            Object.keys(data).forEach(key => dataFormed.append(key, data[key]));
        }
        // console.log(headers);
        let result = await fetch(url, 
        {
            method: method,
            body: new URLSearchParams([...dataFormed.entries()]),
            headers: headers
        });
        return [result.status, await result.json()];
    }

    async _callPrepared(apiMethod, data = [])
    {
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept-Charset': 'UTF-8' 
        };
        if (typeof(this._authentication) != 'undefined') headers['Authorization'] = 'Bearer ' + CryptoJS.AES.decrypt(this._authentication, 'lK2BjOk7gcGi3h31uq1AY').toString(CryptoJS.enc.Utf8);
        return await this._call(this._baseUrl + apiMethod.url, apiMethod.method, data, headers);
    }

    async checkInviteCode(code)
    {
        return await this._callPrepared(APIMethods.inviteCodeValid, {'inviteCode': code});
    }
    async auth(login, password)
    {
        let returnValue = false;
        let result = await this._callPrepared(APIMethods.auth, {'login': login, 'passwordHash': sha256(password)});
        if (result[0] == 200)
        {
            this._authentication = CryptoJS.AES.encrypt(result[1]['response'], 'lK2BjOk7gcGi3h31uq1AY').toString();
            localStorage.setItem('csat', this._authentication);
            returnValue = true;
        }
        return returnValue;
    }

    async accountInfo()
    {
        return this._callPrepared(APIMethods.info);
    }

    async adviceState(state) // AdviceState
    {
        return this._callPrepared(state);
    }

    logout()
    {
        localStorage.removeItem('csat');
        this._authentication = undefined;
        return true;
    }

    async register(inviteCode, login, screenName, password)
    {
        return await this._callPrepared(APIMethods.register, {
            'inviteCode': inviteCode,
            'login': login,
            'screenName': screenName,
            'passwordHash': sha256(password)
        });
    }

    async changePassword(currentPassword, newPassword)
    {
        return await this._callPrepared(APIMethods.changePassword, {
            'currentPasswordHash': sha256(currentPassword),
            'newPasswordHash': sha256(newPassword)
        });
    }

    async statusAdvices()
    {
        
        return this._callPrepared(APIMethods.statusAdvices);
    }

    async getCountes()
    {
        return this._callPrepared(APIMethods.getCountes);
    }
    async getAdvices()
    {
        return this._callPrepared(APIMethods.getAdvices, {'offset': 0, 'limit': 1000});
    }
    async addAdvice(text, priority = 0)
    {
        return this._callPrepared(APIMethods.addAdvice, {'text': text, 'priority': (priority ? 1 : 0)});
    }
    async removeAdvice(id)
    {
        return this._callPrepared(APIMethods.removeAdvice, {'id': id});
    }
    async resumeAdvices()
    {
        return this._callPrepared(APIMethods.resumeAdvices);
    }
    async pauseAdvices()
    {
        return this._callPrepared(APIMethods.pauseAdvices);
    }
    async getConfig()
    {
        return this._callPrepared(APIMethods.getConfig);
    }
    async updateWorkingTimeInterval(workingTime)
    {
        return this._callPrepared(APIMethods.updateWorkingTimeInterval, {'interval': workingTime});
    }
    async updateAdvicesInterval(interval)
    {
        return this._callPrepared(APIMethods.updateAdvicesInterval, {'interval': interval});
    }
    
    async inviteUser(allowInviteUsers = 0)
    {
        return this._callPrepared(APIMethods.inviteUser, {'allowInviteUsers': (allowInviteUsers ? 1 : 0)});
    }


    
}


class APIMethod
{
    url;
    method;

    constructor(url, method)
    {
        this.url = url;
        this.method = method;
    }
}

class APIMethods
{
    static auth = new APIMethod('account/auth', 'POST');
    static register = new APIMethod('account/register', 'POST');
    static info = new APIMethod('account/info', 'POST');
    static inviteUser = new APIMethod('account/invite', 'POST');
    static inviteCodeValid = new APIMethod('account/inviteCodeValid', 'POST');
    static changePassword = new APIMethod('account/changePassword', 'POST');

    static resumeAdvices = new APIMethod('advices/resume', 'POST');
    static pauseAdvices = new APIMethod('advices/pause', 'POST');
    static statusAdvices = new APIMethod('advices/status', 'POST');
    static getCountes = new APIMethod('advices/counters', 'POST');
    static getAdvices = new APIMethod('advices/get', 'POST');
    static addAdvice = new APIMethod('advices/add', 'POST');
    static removeAdvice = new APIMethod('advices/remove', 'POST');
    static getConfig = new APIMethod('advices/getConfig', 'POST');
    static updateWorkingTimeInterval = new APIMethod('advices/updateWorkingTimeInterval', 'POST');
    static updateAdvicesInterval = new APIMethod('advices/updateAdvicesInterval', 'POST');
    updateAdvicesInterval
    
}

class AdviceState
{
    static pause = APIMethods.pauseAdvices;
    static resume = APIMethods.resumeAdvices;
}