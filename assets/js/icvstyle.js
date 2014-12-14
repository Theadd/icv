
var ICVStyle = {
  global: {
    url: ''
  },
  theme: {
    default: {

      //Default Theme
      nodeType: {
        default: {
          //node state. (normal, open)
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
              "radialGradient": false,
              /** Draw multiple node borders for each level of experience if
               * 'true' or specify the number of circles to draw. */
              "multipleCircleWaves": false,
              "centerOnClick": true,
              /** Increase node name based on data.level value. */
              "levelBasedNameSize": true,
              //remove buttons from node expansion (normal state only)
              "removeCenterButton": true,
              "removeUrlButton": false,
              "removeDescButton": false
            }
          },
          open: {
            dim: 92
          }
        },
        category: {
          normal: {
            color: '#445978',
            "extended": {
              "multipleCircleWaves": false
            }
          }
        },
        skill: {
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
        },
        library: {
          normal: {
            color: '#4e7844'
          }
        },
        application: {
          normal: {
            color: '#4e7844'
          }
        }
      },
      "config": {
        "backgroundColor": 'transparent',
        "stickBackgroundImage": true,
        "centerNodeOnHashChange": false
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
                },
                "centerOnClick": false,
                "removeCenterButton": false
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
        },
        "config": {
        "centerNodeOnHashChange": true
        }
      };

      return $.extend(true, {}, ICVStyle.theme.default, soapbubble);
    }),

    /** ReverseSoapBubble Theme (Inner view of soap bubbles)
     *
     * Works fine in IE 11, Chrome 39 and Opera 26 but in Firefox looks like SoapBubble.
     */
    "reversesoapbubble": (function () {
      var colorList = [/*Lightblue*/'#a4bde3' , /*Yellow*/'#e3e3a4', /*Green*/'#4e7844', /*Red*/ '#e67070', /*Blue*/'#445978', /*Orange*/ '#e6b770', /*Cyan*/'#70dee6'];

      var reversesoapbubble = {
        nodeType: {
          default: {
            normal: {
              CanvasStyles: {
                strokeStyle: '#fff',
                lineWidth: 1
              },
              "extended": {
                "radialGradient": {
                  "0": colorList[0],
                  "0.5": '#000',
                  "0.75": colorList[0],
                  "1": '#fff'
                },
                "centerOnClick": false,
                "removeCenterButton": false,
                "multipleCircleWaves": true,
                "levelBasedNameSize": false
              }
            }
          },
          category: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[1],
                  "0.5": '#000',
                  "0.75": colorList[1],
                  "1": '#fff'
                },
                "multipleCircleWaves": false,
                "levelBasedNameSize": false
              }
            }
          },
          framework: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": String(colorList[2]),
                  "0.5": '#000',
                  "0.75": String(colorList[2]),
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          language: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": String(colorList[3]),
                  "0.5": '#000',
                  "0.75": String(colorList[3]),
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          skill: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[4],
                  "0.5": '#000',
                  "0.75": colorList[4],
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          library: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[5],
                  "0.5": '#000',
                  "0.75": colorList[5],
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          },
          application: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[6],
                  "0.5": '#000',
                  "0.75": colorList[6],
                  "1": '#fff'
                },
                "levelBasedNameSize": true
              }
            }
          }
        }
      };

      return $.extend(true, {}, ICVStyle.theme.default, reversesoapbubble);
    })

  }
};

ICVStyle.theme.flatline = ICVStyle.theme.flatline();
ICVStyle.theme.soapbubble = ICVStyle.theme.soapbubble();
ICVStyle.theme.reversesoapbubble = ICVStyle.theme.reversesoapbubble();
