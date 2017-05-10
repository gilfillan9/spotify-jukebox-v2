import queryString from "query-string";

class Api {
    static get(url, data = {}) {
        return this.request(url + (Object.keys(data).length > 0 ? ('?' + queryString.stringify(data)) : '' ), undefined, "GET");
    }

    static post(url, data = {}) {
        return this.request(url, data, "POST");
    }

    static delete(url, data = {}) {
        return this.request(url, data, "DELETE");
    }

    static patch(url, data = {}) {
        return this.request(url, data, "PATCH");
    }

    static request(url, data, method) {
        let req = fetch("http://" + window.location.hostname + ':8080/api/' + url, {
            method: method,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        return new Promise((resolve, reject) => {
            req.then((response) => {
                response.json().then((data) => {
                    if (response.ok && data.success) {
                        resolve(data.data);
                    } else {
                        let e = new Error(data.message);
                        e.response = response;
                        reject(e);
                    }
                }).catch(() => {
                    let e = new Error('Malformed response');
                    e.response = response;
                    reject(e);
                })
            }).catch((e) => {
                reject(new Error(e));
            })
        });
    }
}

export default Api;