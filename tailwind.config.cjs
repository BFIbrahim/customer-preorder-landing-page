module.exports = {
      theme: {
        extend: {
          colors: {
            zocs: {
              teal: '#0B5960',
              deep: '#073F45',
              red: '#A82025',
              cream: '#F8F5EC',
              ink: '#182729'
            }
          },
          fontFamily: { bangla: ['Hind Siliguri', 'sans-serif'] },
          boxShadow: {
            soft: '0 18px 50px rgba(7, 63, 69, .10)',
            card: '0 10px 30px rgba(7, 63, 69, .08)'
          }
        }
      }
    };
module.exports.content = ['./public/**/*.html', './public/js/**/*.js'];
