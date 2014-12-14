/**
 * Available node types:
 *    * default:
 *        i.e.: default
 *    * category:
 *        i.e.: category, field, branch, group, etc.
 *    * language:
 *        i.e.: programming language, runtime environment, markup language, database management system, etc.
 *        e.g.: C++, Node.js, Markdown, LaTeX, Redis, etc.
 *    * framework:
 *        i.e.: framework
 *        Description: With a framework, the framework writer writes the application, and leaves out the interesting details, which you fill in.
 *    * library:
 *        i.e.: library, module, package, toolkit.
 *        Description: Collection/module that provides functionality.
 *        e.g.: jQuery, Qt, memcache, etc.
 *    * skill:
 *        i.e.: skill
 *        e.g.: User Experience (UX), Unit Testing, SEO, etc.
 *    * application:
 *        i.e.: Application, Tool.
 *        e.g.: Apache, Photoshop, Audacity, git, etc.
 */
var techs_json = {
  id: "1",
  name: "Skills",
  children: [
  {
    id: "2",
    name: "Front end development",
    data: {
      type: 'category',
      level: 5,
      active: true,
      note: '',
      desc: '',
      url: ''
    },
    children: [{
      id: "2_1",
      name: "Web based applications",
      data: {
        type: 'category',
        level: 5,
        active: true,
        note: '',
        desc: '',
        url: ''
      },
      children: [{
        id: "2_1_1",
        name: "Multi-platform Frameworks",
        data: {
          type: 'category',
          level: 3,
          active: true,
          note: '',
          desc: '',
          url: ''
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
        type: 'category',
        level: 4,
        active: true,
        note: '',
        desc: '',
        url: ''
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
            type: 'library',
            level: 4,
            active: true,
            note: '',
            desc: '',
            url: ''
          },
          children: []
        }]
      }]
    }]
  }, {
    id: "3",
    name: "Back end development",
    data: {
      type: 'category',
      level: 5,
      active: true,
      note: '',
      desc: '',
      url: ''
    },
    children: [{
      id: "3_1",
      name: "Server Side",
      data: {
        type: 'category',
        level: 5,
        active: true,
        note: '',
        desc: '',
        url: ''
      },
      children: [{
        id: "3_1_1",
        name: "Apache",
        data: {
          type: 'application',
          level: 5,
          active: true,
          note: '',
          desc: '',
          url: ''
        },
        children: []
      }]
    }, {
      id: "3_2",
      name: "Client Side",
      data: {
        type: 'category',
        level: 5,
        active: true,
        note: '',
        desc: '',
        url: ''
      },
      children: []
    }]
  }, {
    id: "4",
    name: "Generic Knowledge",
    data: {
      type: 'category',
      level: 5,
      active: true,
      note: '',
      desc: '',
      url: ''
    },
    children: [{
      id: "4_1",
      name: "Search Engine Optimisation (SEO)",
      data: {
        type: 'skill',
        level: 4,
        active: true,
        note: '',
        desc: '',
        url: ''
      },
      children: []
    }, {
      id: "4_2",
      name: "Regular Expressions",
      data: {
        type: 'skill',
        level: 5,
        active: true,
        note: '',
        desc: '',
        url: ''
      },
      children: []
    }, {
      id: "4_3",
      name: "Databases",
      data: {
        type: 'category',
        level: 5,
        active: true,
        note: '',
        desc: '',
        url: ''
      },
      children: [{
        id: "4_3_1",
        name: "MongoDB",
        data: {
          type: 'language', //so, what?
          level: 5,
          active: true,
          note: 'Replica sets, sharding, query optimization, etc.',
          desc: '',
          url: ''
        },
        children: []
      }, {
        id: "4_3_2",
        name: "Redis",
        data: {
          type: 'language',
          level: 2,
          active: true,
          note: '',
          desc: '',
          url: ''
        },
        children: []
      }]
    }]
  }],
  data: {
    type: 'default',
    level: 1,
    active: true,
    note: '',
    desc: '',
    url: 'https://github.com/Theadd'
  }
};
