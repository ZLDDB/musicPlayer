function toLrcObj(lrcStr) {
  //将歌词的毫秒做属性名；内容做属性值，组成歌词对象
  var lrcArr = lrcStr.split("\n");
  var lrcObj = {};
  lrcArr.forEach((item) => {
    if (item.indexOf("[") != -1) {
      var itemArr = item.split("[");
      if (itemArr[1] != undefined && itemArr[1].indexOf("]") != -1) {
        itemArr = itemArr[1].split("]");
        var timeArr = itemArr[0].split(".");
        var sArr = timeArr[0].split(":");
        var s = parseInt(sArr[0]) * 60 + parseInt(sArr[1]);
        lrcObj[s] = itemArr[1];
      }
    }
  });
  return lrcObj;
}
//获取歌词文本列表
function getLrcList(lrcObj) {
  var lrcList = [];
  for (var sxname in lrcObj) {
    while (lrcObj[sxname][0] == " ") {
      lrcObj[sxname] = lrcObj[sxname].slice(1);
    }
    lrcList.push(lrcObj[sxname]);
  }
  return lrcList;
}
var app = new Vue({
  el: "#music",
  data: {
    picUrl: "media/2345截图20200423155911.png",
    musicUrl: "",
    videoUrl: "",
    searchText: "",
    musicList: [],
    commentList: [],
    isPlay: "",
    mvUrl: "",
    isPlayVideo: "noVideo",
    lrcObj: {},
    lrcList: [],
    show: "showPic",
    idName: "",
    row: 0,
  },
  methods: {
    //是否显示歌词
    showLrc: function () {
      this.show = "showLrc";
    },
    showPic: function () {
      this.show = "showPic";
    },
    //歌曲播放实现歌词滚动
    lrcScroll: function () {
      var audio = document.querySelector("audio");
      var currentTime = parseInt(audio.currentTime); //当前正播放的歌词内容
      if (this.lrcObj[currentTime]) {
        //恢复上一行的样式&换当前行的样式
        if (this.idName != "") {
          document.getElementById(this.idName).style.color = "rgb(35, 11, 78)";
          document.getElementById(this.idName).style.fontSize = "15px";
        }
        this.idName = this.lrcObj[currentTime];
        document.getElementById(this.idName).style.color = "rgb(220, 231, 60)";
        document.getElementById(this.idName).style.fontSize = "19px";
        var newRow = this.lrcList.indexOf(this.idName); //获取当前行
        //从第七行开始，如果行变化就滚动
        if (newRow != this.row) {
          this.row = newRow;
          var lrcStyle = document.querySelector("#lrc ul").style;
          if (newRow < 7) {
            lrcStyle.setProperty("top", 0);
          }
          if (newRow >= 7) {
            var addRow = newRow - 6;
            var top = -27 * addRow + "px";
            lrcStyle.setProperty("top", top);
          }
        }
      }
    },
    //音乐播放或暂停
    playing: function () {
      this.isPlay = "play";
    },
    paused: function () {
      this.isPlay = "pause";
    },
    //找到歌单
    goSearch: function () {
      axios
        .get("https://autumnfish.cn/search?keywords=" + this.searchText)
        .then((response) => {
          this.musicList = response.data.result.songs;
        });
      this.searchText = "";
    },
    playMusic: function (idNum) {
      //找到音乐播放地址
      axios
        .get("https://autumnfish.cn/song/url?id=" + idNum)
        .then((response) => {
          this.musicUrl = response.data.data["0"].url;
          if (this.musicUrl == null) {
            alert("这首歌要付钱呐！T^T");
          }
        });
      //找到歌词
      axios.get("https://autumnfish.cn//lyric?id=" + idNum).then((response) => {
        var lrcStr = response.data.lrc.lyric;
        this.lrcObj = toLrcObj(lrcStr);
        this.lrcList = getLrcList(this.lrcObj);
      });
      //找到音乐详情
      axios
        .get("https://autumnfish.cn/song/detail?ids=" + idNum)
        .then((response) => {
          this.picUrl = response.data.songs["0"].al.picUrl;
        });
      //找到音乐热评
      axios
        .get("https://autumnfish.cn/comment/hot?type=0&id=" + idNum)
        .then((response) => {
          this.commentList = response.data.hotComments;
        });
    },
    //找到视频播放地址
    playVideo: function (mvid) {
      var audio = document.querySelector("audio");
      audio.pause();
      this.isPlayVideo = "hasVideo";
      axios.get("https://autumnfish.cn/mv/url?id=" + mvid).then((response) => {
        this.mvUrl = response.data.data.url;
      });
    },
    stopVideo: function () {
      this.isPlayVideo = "noVideo";
      this.mvUrl = "#";
      var audio = document.querySelector("audio");
      audio.play();
    },
  },
});
