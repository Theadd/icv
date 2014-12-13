

//language(c),
//technology(ajax),
//skill/aptitude(UX, UNIT TESTING),
//framework/package(sails, apache, express)

var ICVStyle = {
  global: {
    url: ''
  },
  theme: {
    default: {

      //Default Theme
      nodeType: {
        default: {
          //node state
          normal: {
            //color: 'rgba(200, 220, 230, 0.5)',
            //edgeColor: 'rgba(200, 220, 230, 0.5)'
            //overridable: true,
            //type: 'custom',
            color: '#445978',
            dim: 32,
            //CanvasStyles: {
              //fillStyle: '#daa',
              //strokeStyle: '#fff',
              //lineWidth: 1
            //},
            "extended": {
              "radialGradient": false
            }
          },
          hover: {
            dim: 92
          }
        },
        aptitude: {
          normal: {
            color: '#4e7844'
          }
        },
        framework: {
          normal: {
            color: '#4e7844'
          }
        },
        language: {
          normal: {
            color: '#4e7844'
          }
        }
      },
      config: {
        "backgroundColor": 'transparent',
        "stickBackgroundImage": true
      }
    },

    "flatline": (function () {
      var value = $.extend(true, {}, ICVStyle.theme.default);

      value.nodeType.default.normal.CanvasStyles = { "strokeStyle": "#fff", lineWidth: 1 };

      return value;
    }),

    //SoapBubble Theme
    "soapbubble": (function () {
      var soapbubble = {
        nodeType: {
          default: {
            normal: {
              CanvasStyles: {
                strokeStyle: '#fff',
                lineWidth: 1
              },
              "extended": {
                "radialGradient": {
                  "0": '#445978',
                  "1": '#fff'
                }
              }
            }
          },
          framework: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": '#4e7844',
                  "1": '#fff'
                }
              }
            }
          }
        }
      };

      return $.extend(true, {}, ICVStyle.theme.default, soapbubble);
    }),

    /** ReverseSoapBubble Theme (Inner view of soap bubbles)
     *
     * Works fine in IE 11, Chrome 39 and Opera 26 but in Firefox looks like SoapBubble.
     */
    "reversesoapbubble": (function () {
      var reversesoapbubble = {
        nodeType: {
          default: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": '#445978',
                  "0.5": '#000',
                  "0.75": '#445978',
                  "1": '#fff'
                }
              }
            },
            framework: {
              normal: {
                "extended": {
                  "radialGradient": {
                    "0": '#4e7844',
                    "0.5": '#000',
                    "0.75": '#4e7844',
                    "1": '#fff'
                  }
                }
              }
            }
          }
        }
      };

      return $.extend(true, {}, ICVStyle.theme.soapbubble, reversesoapbubble);
    })


  }
};

ICVStyle.theme.flatline = ICVStyle.theme.flatline();
ICVStyle.theme.soapbubble = ICVStyle.theme.soapbubble();
ICVStyle.theme.reversesoapbubble = ICVStyle.theme.reversesoapbubble();
