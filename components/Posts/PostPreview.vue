<template>
  <nuxt-link :to="postLink" class="post-preview">
    <article>
      <div
        class="post-thumbnail"
        :style="{backgroundImage: 'url(' + thumbnail + ')'}"></div>
      <div class="post-content">
        <h1>{{ title }}</h1>
        <p>{{ previewText }}</p>
  <div>
    <nuxt-link :to="postLink" class="post-preview">
      <article>
        <div
          class="post-thumbnail"
          :style="{backgroundImage: 'url(' + thumbnail + ')'}"></div>
        <div class="post-content">
          <h1>{{ title }}</h1>
          <p>{{ previewText }}</p>
        </div>
      </article>
    </nuxt-link>
    <div class="btn_area">
      <div>
        <button 
          @click="addLike"
          class="btn like-btn"> 
        </button>
        <span class="like-count">{{ like }}いいね</span>
      </div>
    </article>
  </nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
    }
  },
  name: 'PostPreview',
  props: {
    id: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    previewText: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    like: {
      type: Number
    },
    }
  },
  computed: {
    postLink() {
      return this.isAdmin ? '/admin/' + this.id : '/posts/' + this.id
    }
  },
  methods: {
    addLike() {
      this.$store.dispatch("addLike", this.id).then(() => {
      });
    },
  }
}
</script>


<style scoped>
.post-preview {
  border: 1px solid #ccc;
  box-shadow: 0 2px 2px #ccc;
  background-color: white;
  width: 90%;
}

a {
  text-decoration: none;
  color: black;
}

@media (min-width: 850px) {
  .post-preview {
    width: 400px;
    margin: 10px;
  }
}

.post-thumbnail {
  width: 100%;
  height: 200px;
  background-position: center;
  background-size: cover;
}

.post-content {
  display: inline-block;
  padding: 10px;
  text-align: center;
}

a:hover .post-content,
a:active .post-content {
  background-color: #ccc;
}
.btn-area {
  display: inline-block;
}
</style>
