
$icv.Style = {
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
               * 'true' or specify the number of circles to draw.
               *
               * It can be a function, with node as argument, returning one of those values.
               */
              "multipleCircleWaves": false,
              "centerOnClick": true,
              /** Increase node name based on data.level value. */
              "levelBasedNameSize": true,
              //remove buttons from node expansion (normal state only)
              "removeCenterButton": true,
              "removeUrlButton": false,
              "removeDescButton": false,
              /** Color of the line pointing to this node. */
              "edgeColor": '#445978'
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
        "centerNodeOnHashChange": false,
        /** Whether use the custom ‘Native’ canvas Event System of the library or to attach
         *  the events onto the HTML labels (via event delegation).
         */
        "nativeEvents": false
      }
    },

    "flatline": (function () {
      var value = $.extend(true, {}, $icv.Style.theme.default);

      value.nodeType.default.normal.CanvasStyles = { "strokeStyle": "#fff", lineWidth: 1 };
      value.nodeType.default.normal.extended.edgeColor = '#fff';

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
                "removeCenterButton": false,
                "edgeColor": '#fff'
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

      return $.extend(true, {}, $icv.Style.theme.default, soapbubble);
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
                "levelBasedNameSize": false,
                "edgeColor": '#fff'
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
        },
        "config": {
          "centerNodeOnHashChange": true
        }
      };

      return $.extend(true, {}, $icv.Style.theme.default, reversesoapbubble);
    }),

    /** Chemical Theme. */
    "chemical": (function () {
      var colorList = [/*Lightblue*/'#a4bde3' , /*Yellow*/'#e3e3a4', /*Green*/'#4e7844', /*Red*/ '#e67070', /*Blue*/'#445978', /*Orange*/ '#e6b770', /*Cyan*/'#70dee6'];

      var chemical = {
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
                  "0.5": '#000'
                },
                "centerOnClick": false,
                "removeCenterButton": false,
                "multipleCircleWaves": function (node) {
                  return (node.data && node.data.active) ? 2 : 1;
                },
                "levelBasedNameSize": false,
                "edgeColor": '#fff',
                /** When not false, overwrites default node dimension with the returned value of a function. */
                "dim": function (node) {
                  return (Math.max(Math.min(Math.round(parseInt(node.data.level || '1')), 5), 1) - 1) * 7 + 15
                }
              }
            },
            open: {
              dim: 92,
              "extended": {
                "dim": false
              }
            }
          },
          category: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[0],
                  "0.5": '#000'
                },
                "levelBasedNameSize": false
              }
            }
          },
          framework: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[2],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          language: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[4],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          skill: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[6],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          library: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[2],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          },
          application: {
            normal: {
              "extended": {
                "radialGradient": {
                  "0": colorList[3],
                  "0.5": '#000'
                },
                "levelBasedNameSize": true
              }
            }
          }
        },
        "config": {
          "centerNodeOnHashChange": true,
          "nativeEvents": true
        }
      };

      return $.extend(true, {}, $icv.Style.theme.default, chemical);
    })

  }
};

$icv.Style.theme.flatline = $icv.Style.theme.flatline();
$icv.Style.theme.soapbubble = $icv.Style.theme.soapbubble();
$icv.Style.theme.reversesoapbubble = $icv.Style.theme.reversesoapbubble();
$icv.Style.theme.chemical = $icv.Style.theme.chemical();
