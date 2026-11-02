!function (n, e) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (n = "undefined" != typeof globalThis ? globalThis : n || self).miniplay = e();
}(this, function () {
  "use strict";

  const n = {
    t: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    o: null,
    loadScript: function () {
      // Flashist Adaptation
      // if (null != this.o)
      //   return this.o;
      // this.o = new Promise((n2, e) => {
      //   const t = document.createElement("script");
      //   t.src = this.t, t.async = true,
      //     t.setAttribute("data-ad-frequency-hint", "180s"),
      //     t.setAttribute("data-ad-client", "ca-pub-6129580795478709"),
      //     t.setAttribute("data-ad-channel", "1022121135"),
      //     // t.setAttribute("data-adbreak-test", "on"),
      //     t.onload = n2, t.onerror = e, window.document.head.appendChild(t), console.log("end load google sdk");
      // });
    },

    i: null, l: null,
    isInit: function () {
      return null != this.i && null != this.l && null != this.config;
    },

    isReady: false,
    initAsync: async function () {
      if (this.isInit())
        return Promise.resolve();
      try {
        return await this.loadScript(), window.adsbygoogle = window.adsbygoogle || [], n.i = n.l = function (n2) {
          console.log("call adsbygoogle.push(): " + JSON.stringify(n2)), window.adsbygoogle.push(n2);
        }, Promise.resolve();
      } catch (n2) {
        return Promise.reject(new Error("load js error"));
      }
    },
    startAsync: async function () {
      return new Promise((e, t) => {
        let o = {
          sound: "on", preloadAdBreaks: "on", onReady: () => {
            n.isReady = true, e()
            // n.adBreak({ type: "preroll", name: "preroll_name" });
          }
        };
        n.l(o);
      });
    },
    adBreak: function (n2) {
      let e = this.generateAdBreakParams(n2);
      this.isInit() ? this.i(e) : this.initAsync().then(() => {
        this.i(e);
      });
    },
    gtag: function (...n2) {
      console.log(n2);
    },
    generateAdBreakParams: function (n2) {
      let e = {
        type: n2.type, name: n2.name, adBreakDone: (e2) => {
          void 0 !== n2.adBreakDone && null != n2.adBreakDone && n2.adBreakDone(e2);
        }
      };
      return "preroll" === n2.type || ("reward" === n2.type ? (e.beforeReward = function (e2) {
        e2(), void 0 !== n2.beforeReward && null != n2.beforeReward && n2.beforeReward(e2);
      }, e.adDismissed = function () {
        void 0 !== n2.adDismissed && null != n2.adDismissed && n2.adDismissed();
      }, e.adViewed = function () {
        void 0 !== n2.adViewed && null != n2.adViewed && n2.adViewed();
      }) : (e.beforeAd = () => {
        void 0 !== n2.beforeAd && null != n2.beforeAd && n2.beforeAd();
      }, e.afterAd = () => {
        void 0 !== n2.afterAd && null != n2.afterAd && n2.afterAd();
      })), e;
    }
  };
  return {
    initAsync: async function () {
      return n.isInit() ? Promise.resolve() : n.initAsync().then(() => n.startAsync());
    },
    adBreak: async function (e) {
      n.adBreak(e);
    },
    gtag: function (e) {
      n.gtag(e);
    },
    isReady: function () {
      return n.isReady;
    },
    setLoadingProgress: function (n2) {
      console.log("progress: " + n2);
    },
    showRewardAsync: async function () {
      function e() {
        return new Promise((e2, t) => {
          n.adBreak({
            type: "reward", name: "rewarded Ad",
            adBreakDone: (n2) => {
              console.error("showRewardAsync:", n2.breakStatus)

              // "viewed" === n2.breakStatus || "dismissed" === n2.breakStatus ? e2(n2.breakStatus) : t(n2.breakStatus);
              "viewed" === n2.breakStatus ? e2(n2.breakStatus) : t(n2.breakStatus);
            }
          });
        });
      }
      return n.isInit() ? e() : n.initAsync().then(() => e());
    },
    showInterstitialAsync: async function (type, key) {
      function e() {
        return new Promise((e2, t) => {
          n.adBreak({
            type: type, name: key,
            adBreakDone: (n2) => {
              "viewed" === n2.breakStatus ? e2(n2.breakStatus) : t(n2.breakStatus);
            }
          });
        });
      }
      return n.isInit() ? e() : n.initAsync().then(() => e());
    },

    login(callback, forceLogin = false) {
      if (forceLogin) {
        ID.getLoginStatus(function (data) {
          let userInfoRes = {};
          userInfoRes.userInfo = {};
          if (data.status == "ok") {
            let details = data.authResponse.details;
            userInfoRes.userInfo.openid = details.pid;
            userInfoRes.userInfo.nickName = details.nickname;
            userInfoRes.userInfo.avatarUrl = details.avatars.large_url;
            callback && callback(userInfoRes)
          } else {
            ID.login((res) => {
              let details2 = res.authResponse.details;
              userInfoRes.userInfo.openid = details2.pid;
              userInfoRes.userInfo.nickName = details2.nickname;
              userInfoRes.userInfo.avatarUrl = details2.avatars.large_url;
              callback && callback(userInfoRes)
            });
          }

        });

        return;
      }
      ID.getLoginStatus(function (data) {
        let userInfoRes = {};
        userInfoRes.userInfo = {};
        console.error("data:", data);
        if (data.authResponse == null) {
          //Not Login
          userInfoRes.userInfo.openid = "198544";
          userInfoRes.userInfo.nickName = "Guest";
          userInfoRes.userInfo.avatarUrl = "";
          callback && callback(userInfoRes)
        } else {
          if (data.status == "ok") {
            //had login
            let details = data.authResponse.details;
            userInfoRes.userInfo.openid = details.pid;
            userInfoRes.userInfo.nickName = details.nickname;
            userInfoRes.userInfo.avatarUrl = details.avatars.large_url;
            callback && callback(userInfoRes)
          } else if (data.status == 'not_linked' || data.status == 'uncomplete') {
            ID.login((res) => {
              let details2 = res.authResponse.details;
              userInfoRes.userInfo.openid = details2.pid;
              userInfoRes.userInfo.nickName = details2.nickname;
              userInfoRes.userInfo.avatarUrl = details2.avatars.large_url;
              console.error("userInfo:", userInfoRes);
              callback && callback(userInfoRes)
            });
          } else {
            //Not login
          }
        }

        // if (data.status == 'ok') {
        //   let details = data.authResponse.details;
        //   userInfoRes.userInfo.openid = details.pid;
        //   userInfoRes.userInfo.nickName = "Player";
        //   userInfoRes.userInfo.avatarUrl = details.avatars.large_url;
        //   console.error("userInfo:", userInfoRes);
        //   callback && callback(userInfoRes)
        // } else {
        //   ID.login((res) => {
        //     let details2 = res.authResponse.details;
        //     userInfoRes.userInfo.openid = details2.pid;
        //     userInfoRes.userInfo.nickName = details2.nickname;
        //     userInfoRes.userInfo.avatarUrl = details2.avatars.large_url;
        //     console.error("userInfo:", userInfoRes);
        //     callback && callback(userInfoRes)
        //   });
        // }
      });
    },

    setRank(obj) {
      console.warn("setRank:", obj);
      ID.GameAPI.Leaderboards.save({
        table: obj.rankName, // coins
        points: obj.score // 1650
      }, (res) => {
        console.warn("setRank callback:", res);
      })
    },

    getRank(obj) {
      console.warn("getRank:", obj);
      let rankInfo = {
        table: obj.rankName,
        mode: "alltime", //alltime, last30days, last7days, today, or newest
        perPage: 100
      }
      var data = {};
      ID.GameAPI.Leaderboards.listCustom(rankInfo, (res) => {
        if (res.success && res.scores) {
          var list = [];
          for (let index = 0; index < res.scores.length; index++) {
            const rankdata = res.scores[index];
            var newRankData = {
              name: rankdata.playername,
              openid: rankdata.playerid,
              score: rankdata.points,
              rank: rankdata.rank,
              avatarUrl: "",
              isSelf: false
            }
            list.push(newRankData)
          }
          data.ranks = list;
          obj.success(data);
        }


      })

    },

    save(key, data) {
      ID.api('user_data/submit', 'POST', { key: key, value: data }, function (response) {
        console.warn(response);
      });
    },

    load(key, callback) {
      ID.api('user_data/retrieve', 'POST', { key: key }, function (res) {
        try {
          callback(res.jsondata);
        } catch (e) {
          console.warn("miniplay loaddata err:", e);
          callback("")
        }
      });
    }
  };
});
