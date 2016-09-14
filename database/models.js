
class Message {

  constructor(data) {

    if (!(data.channel && data.user && data.name && data.color && data.text && data.translation && data.ts)) {
      throw new Error('Missing data argument!');
    }

    this.channel = data.channel;
    this.user = data.user;
    this.name = data.name;
    this.color = data.color;
    this.text = data.text;
    this.translation = data.translation;
    this.ts = data.ts;
  }

}


module.exports = {
  Message
};
