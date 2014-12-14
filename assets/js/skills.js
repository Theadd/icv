
var techs_json = {
  id: "1",
  name: "Skills",
  children: [{
    id: "2",
    name: "Front end development",
    data: {
      relation: "<h4>...</h4>"
    },
    children: [{
      id: "2_1",
      name: "Web based applications",
      data: {
        relation: "<h4>...</h4>"
      },
      children: [{
        id: "2_1_1",
        name: "Multi-platform Frameworks",
        data: {
          relation: "<h4>...</h4>"
        },
        children: [{
          id: "2_1_1_1",
          name: "Atom-Shell",
          data: {
            type: 'framework',
            level: 5,
            active: true,
            note: 'Chromium based cross-platform desktop applications',
            desc: 'Chromium based cross-platform desktop applications using JavaScript, HTML and CSS.',
            url: 'https://github.com/atom/atom-shell'
          },
          children: []
        }]
      }]
    }, {
      id: "2_2",
      name: "Native applications",
      data: {
        relation: "<h4>...</h4>"
      },
      children: [{
        id: "2_2_1",
        name: "C++",
        data: {
          type: 'language',
          level: 3,
          active: false,
          note: '',
          desc: 'C++ (pronounced cee plus plus) is a general purpose programming language. It has imperative, object-oriented and generic programming features.',
          url: ''
        },
        children: [{
          id: "2_2_1_1",
          name: "JUCE",
          data: {
            relation: "<h4>...</h4>"
          },
          children: []
        }]
      }]
    }]
  }, {
    id: "3",
    name: "Back end development",
    data: {
      relation: "<h4>...</h4>"
    },
    children: [{
      id: "3_1",
      name: "Server Side",
      data: {
        relation: "<h4>...</h4>"
      },
      children: []
    }, {
      id: "3_2",
      name: "Client Side",
      data: {
        relation: "<h4>...</h4>"
      },
      children: []
    }]
  }, {
    id: "4",
    name: "Generic Knowledge",
    data: {
      relation: "<h4>...</h4>"
    },
    children: [{
      id: "4_1",
      name: "Search Engine Optimisation (SEO)",
      data: {
        relation: "<h4>...</h4>"
      },
      children: []
    }, {
      id: "4_2",
      name: "Regular Expressions",
      data: {
        type: 'aptitude',
        relation: "<h4>...</h4>"
      },
      children: []
    }, {
      id: "4_3",
      name: "Databases",
      data: {
        relation: "<h4>...</h4>"
      },
      children: [{
        id: "4_3_1",
        name: "MongoDB",
        data: {
          relation: "<h4>...</h4>"
        },
        children: []
      }, {
        id: "4_3_2",
        name: "Redis",
        data: {
          relation: "<h4>...</h4>"
        },
        children: []
      }]
    }]
  }],
  data: {
    relation: "<h4>Root node</h4>"
  }
};
