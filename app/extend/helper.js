const recommend = {
  itemWidth(length) {
    if (!length){
      return "{}";
    }
    return JSON.stringify({
      width: `${length * 300 - 20}px`
    });
  },
  getCoinShowName(name, coinList = {}) {
    if (name && coinList && coinList[name.toUpperCase()]) {
      return coinList[name.toUpperCase()].showName || name;
    }
    return name;
  }
};

const footer = {
  logo(msg){
    return msg.footer_logo_path || msg.logoUrl;
  }
};

exports.footer = footer;

exports.recommend = recommend;
