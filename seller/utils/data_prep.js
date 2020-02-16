

/////////video prep////////////
function hash_vid(){
    var hash2 = crypto.createHash('sha256');
    var stream = fs.createReadStream('your_target.mp4')

    stream.on('data', function(data) {
    hash2.update(data, 'utf8')
    })

    stream.on('end', function() {
    const video_hash = hash2.digest('hex');// 34f7a3113803f8ed3b8fd7ce5656ebec
    console.log('video length:',video_hash);
    //escrow.addHash(video_hash);
    })
}

//get video length
const { getVideoDurationInSeconds } = require('get-video-duration')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

//set K and fps
// async function enterK(){
//     console.log('***** K not defined, choose K value *****')
//     inquirer
//       .prompt([
//         {
//           name: 'K_number',
//           message: 'Choose the chunk size you like?',
//           //default: 'Alligators, of course!',
//         }
//       ])
//       .then(answers => {
//         return answers.K_number;
//       });
// }

const FPS = 36;

async function prep_video(){
  //screen shot frames
  ffmpeg('sample4.mp4')
      .fps(FPS)
      .on('end', function() {
        console.log('Screenshots taken');
      })
      .output('../seller/data/frames-%04d.jpg')
      .run()
}

function getDur(){
  return new Promise(function(resolve,reject){
    getVideoDurationInSeconds('sample4.mp4')
      .then((dur) => {
      var duration = dur;
      // console.log(duration);
              resolve(dur);
    })
  });
}



module.exports = {prep_video,FPS, getDur}
