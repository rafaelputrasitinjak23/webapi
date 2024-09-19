const axios = require('axios');
const cheerio = require('cheerio');

class YouTubeMusic {
  constructor(query) {
    this.query = query;
    this.baseURL = 'https://music.youtube.com/youtubei/v1/';
    this.clientName = 'WEB_REMIX';
    this.clientVersion = '1.20230909.01.00';
    this.shortUrlService = 'https://xzr.my.id';
    this.videoDataService = 'https://cc.ecoe.cc';
  }

  async fetchShortUrl(url) {
    try {
      const response = await axios.get(`${this.shortUrlService}/?url=${encodeURIComponent(url)}`);
      const $ = cheerio.load(response.data);
      return $('.url-item')
        .filter((i, el) => $(el).find('.url-label').text().includes('Short URL:'))
        .find('.url-box p')
        .text()
        .trim();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async fetchSongData() {
  const startTime = Date.now();
    try {
      const searchData = await this._searchSongs();
      const video = searchData[0];

      if (!video) {
        console.log('No songs found');
        return {
          timeTaken: (Date.now() - startTime) / 1000,
          result: null
        };
      }

      const downloadData = await this._fetchVideoData(video.videoUrl);
      const thumbnail = video.thumbnails[0]?.url ? await this.fetchShortUrl(video.thumbnails[0]?.url) : '';
      const download = downloadData.downloadURL ? await this.fetchShortUrl(downloadData.downloadURL) : '';

      return{
      time: (Date.now() - startTime) / 1000,
      data: {
        title: video.title,
        videoUrl: video.videoUrl,
        thumbnail,
        info: video.info || '',
        download
      }
     };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async _searchSongs() {
    try {
      const body = this._buildSearchBody();
      const response = await axios.post(`${this.baseURL}search?prettyPrint=false`, body);
      return this._extractVideos(response.data, 'Songs');
    } catch (error) {
      console.error('Error during search:', error);
      throw error;
    }
  }

  _buildSearchBody() {
    return {
      context: {
        client: {
          clientName: this.clientName,
          clientVersion: this.clientVersion,
        },
      },
      query: this.query,
      params: 'Eg-KAQwIARAAGAAgACgAMABqChAEEAMQCRAFEAo%3D',
    };
  }

  _extractVideos(data, category) {
    const contents = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    const videos = [];

    contents.forEach((section) => {
      if (section.musicShelfRenderer?.title?.runs?.[0]?.text === category) {
        section.musicShelfRenderer.contents.forEach((item) => {
          const video = {
            title: item.musicResponsiveListItemRenderer?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text,
            videoUrl: `https://www.youtube.com/watch?v=${item.musicResponsiveListItemRenderer?.playlistItemData?.videoId}`,
            thumbnails: item.musicResponsiveListItemRenderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [],
            info: item.musicResponsiveListItemRenderer?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map(run => run.text).join(' ') || '',
          };
          videos.push(video);
        });
      }
    });

    return videos;
  }

  async _fetchVideoData(videoUrl) {
    try {
      const timestamp = Date.now() / 1000;

      const { data: { convertURL } } = await this._request(
        `${this.videoDataService}/api/v1/init`, 
        { p: 'y', 1337: 'M17n1ck', _: timestamp }
      );

      const { data: { redirectURL } } = await this._request(
        convertURL, 
        { v: videoUrl, f: 'mp3', _: timestamp }
      );

      const { data } = await this._request(redirectURL);

      return {
        downloadURL: data.downloadURL,
        thumbnailURL: data.thumbnailURL,
        info: data.info
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  _request(url, params = {}) {
    return axios.get(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://ytmp3.ms/'
      }
    });
  }
}

