import Vuex from "vuex";
import Cookie from "js-cookie";

const createStore = () => {
  return new Vuex.Store({
    state: {
      loadedPosts: [],
      token: null,
    },
    mutations: {
      setPosts(state, posts) {
        state.loadedPosts = posts;
      },
      addPost(state, post) {
        state.loadedPosts.push(post);
      },
      editPost(state, editedPost) {
        const postIndex = state.loadedPosts.findIndex(
          post => post.id === editedPost.id
        );
        state.loadedPosts[postIndex] = editedPost;
      },
      deletePost(state, deletepost) {
        state.loadedPosts.slice(deletepost.id,1);
      }, 
      setToken(state, token) {
        state.token = token;
      },
      clearToken(state) {
        state.token = null;
      }
    },
    actions: {
      nuxtServerInit(vuexContext, context) {
        return context.app.$axios
          .$get("https://nuxt-auth-d4b8b-default-rtdb.firebaseio.com/posts.json")
          .then(data => {
            const postsArray = [];
            for (const key in data) {
              postsArray.push({ ...data[key], id: key });
            }
            vuexContext.commit("setPosts", postsArray);
          })
          .catch(e => context.error(e));
      },
      addPost(vuexContext, post) {
        const createdPost = {
          ...post,
          updatedDate: new Date()
        };
        return this.$axios
          .$post(
            "https://nuxt-auth-d4b8b-default-rtdb.firebaseio.com/posts.json?auth=" +
              vuexContext.state.token,
            createdPost
          )
          .then(data => {
            vuexContext.commit("addPost", { ...createdPost, id: data.name });
          })
          .catch(e => console.log(e));
      },
      editPost(vuexContext, editedPost) {
        console.log(editedPost)
        return this.$axios
          .$put(
            "https://nuxt-blog.firebaseio.com/posts/" +
              editedPost.id +
              ".json?auth=" +
              vuexContext.state.token,
            editedPost
          )
          .then(res => {
            vuexContext.commit("editPost", editedPost);
          })
          .catch(e => console.log(e));
      },
      deletePost(vuexContext, deletedPost) {
        return this.$axios
        .$delete(
          "https://nuxt-auth-d4b8b-default-rtdb.firebaseio.com/posts/" +
          deletedPost.id +
          ".json?auth=" +
          vuexContext.state.token,
          deletedPost
        )
          .then(res => {
            vuexContext.commit("deletePost", deletedPost);
          })
          .catch(e => console.log(e));
      },
      addLike(vuexContext, id) {
        // loadedpostの中からidで特定する
        const post = vuexContext.state.loadedPosts.findIndex(
          post => post.id === id
        );
        const contentPost = vuexContext.state.loadedPosts[post]
        contentPost.like++
        // 特定したpostのlikeを変更する ++
        return this.$axios
        .$put(
          "https://nuxt-auth-d4b8b-default-rtdb.firebaseio.com/posts/" +
          id +
          ".json?auth=" + 
          vuexContext.state.token,
          contentPost
        )
          .catch(e => console.log(e));
      },
      addFavorite(vuexContext, id) {
        const fvpost = vuexContext.state.loadedPosts.findIndex(
          post => post.id === id
        );
        const favoritePost = vuexContext.state.loadedPosts[fvpost]
        favoritePost.favorite = true
        return this.$axios
        .$put(
          "https://nuxt-auth-d4b8b-default-rtdb.firebaseio.com/posts/" +
          id +
          ".json?auth=" + 
          vuexContext.state.token,
          favoritePost
        )
        .catch(e => console.log(e));
      },
      notFavorite(vuexContext, id) {
        const nfpost = vuexContext.state.loadedPosts.findIndex(
          post => post.id === id
        );
        const notfavoritePost = vuexContext.state.loadedPosts[nfpost]
        notfavoritePost.favorite = false
        return this.$axios
        .$put(
          "https://nuxt-auth-d4b8b-default-rtdb.firebaseio.com/posts/" +
          id +
          ".json?auth=" + 
          vuexContext.state.token,
          notfavoritePost
        )
        .catch(e => console.log(e));
      },
      setPosts(vuexContext, posts) {
        vuexContext.commit("setPosts", posts);
      },
      authenticateUser(vuexContext, authData) {
        let authUrl =
          "https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=" +
          process.env.fbAPIKey;
        if (!authData.isLogin) {
          authUrl =
            "https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=" +
            process.env.fbAPIKey;
        }
        return this.$axios
          .$post(authUrl, {
            email: authData.email,
            password: authData.password,
            returnSecureToken: true
          })
          .then(result => {
            vuexContext.commit("setToken", result.idToken);
            localStorage.setItem("token", result.idToken);
            localStorage.setItem(
              "tokenExpiration",
              new Date().getTime() + Number.parseInt(result.expiresIn) * 1000
            );
            Cookie.set("jwt", result.idToken);
            Cookie.set(
              "expirationDate",
              new Date().getTime() + Number.parseInt(result.expiresIn) * 1000
            );
            return this.$axios.$post('http://localhost:3000/api/track-data', {data: 'Authenticated!'})
          })
          .catch(e => console.log(e));
      },
      initAuth(vuexContext, req) {
        let token;
        let expirationDate;
        if (req) {
          if (!req.headers.cookie) {
            return;
          }
          const jwtCookie = req.headers.cookie
            .split(";")
            .find(c => c.trim().startsWith("jwt="));
          if (!jwtCookie) {
            return;
          }
          token = jwtCookie.split("=")[1];
          expirationDate = req.headers.cookie
            .split(";")
            .find(c => c.trim().startsWith("expirationDate="))
            .split("=")[1];
        } else if (process.client) {
          token = localStorage.getItem("token");
          expirationDate = localStorage.getItem("tokenExpiration");
        }
        if (new Date().getTime() > +expirationDate || !token) {
          console.log("No token or invalid token");
          vuexContext.dispatch("logout");
          return;
        }
        vuexContext.commit("setToken", token);
      },
      logout(vuexContext) {
        vuexContext.commit("clearToken");
        Cookie.remove("jwt");
        Cookie.remove("expirationDate");
        if (process.client) {
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpiration");
        }
      }
    },
    getters: {
      loadedPosts(state) {
        return state.loadedPosts;
      },
      isAuthenticated(state) {
        return state.token != null;
      }
    }
  });
};

export default createStore;
