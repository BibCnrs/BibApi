export const logout = function* logout() {
    try {
        this.cookies.set('bibapi_token', null, {
            httpOnly: true,
        });
        this.body = {
            done: true,
        };
        this.status = 200;
        return;
    } catch (e) {
        this.status = 400;
    }
};
