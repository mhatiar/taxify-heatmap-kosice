module.exports = {
    ensureCorrectRole: function (role) {
        return function (req, res, next) {
            if (req.user.role === role) {
                next();
            } else {
                res.sendStatus(403);
            }
        }
    },
    ensureSubscriptionActive: function (req, res, next) {
        if(req.user.subscriptionStatus === "active") {
            next();
        }else{
            res.render('pages/subscribe', { page: "Subscribe", user: req.user});
        }
    }
};