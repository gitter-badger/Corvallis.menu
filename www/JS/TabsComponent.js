

define(function(require)
{  
  if(!Ractive.components.TabsComponent)
  {
    //counter for the number of tabs components that have been created
    var numTabsComponents = 0
    function subCompInit()
    {
      var thisComp = this  
      var tabsComp = this.get("tabsComp")
      this.on("Select", 
        function()
        {  
          tabsComp.set("SelectedPane", thisComp.get("PaneId"))
        })
    }
    
    Ractive.components.TabsComponent = Ractive.extend({
      template:'{{>content}}',
      components:
      {
        //The link subcomponent that will be used to select a page
        TabsLink: Ractive.extend(
          {
            template: '<div on-tap="Select">{{>content}}</div>',
            data: { Selected: false },
            init: subCompInit
          }),
        //The pane subcomponent that will display a page
        TabsPane: Ractive.extend(
          {
            template: '<div  {{^Selected}} style="display: none" {{/Selected}}>{{>content}}</div>',
            data: { Selected: false },
            init: subCompInit
          })
      },
      data: 
      {
        SelectedPane: false,
        tabsId: -1
      },
      //Assigns a tabsId to the component,
      //and assigns the select handlers for its subcomponents.
      init: function()
      {   
        //calculate id for this new tabs component
        this.set("tabsId", numTabsComponents++)
        this.set("tabsComp", this)
        var tabsComp = this
        //observe SelectedPane so that when it changes,
        //we will update the visibility of all child components accordingly
        this.observe("SelectedPane", 
          function(newVal, oldVal, keypath)
          {
            //create helper functions
            function _sameComponent(comp)
            {
              return comp.get("tabsId") === tabsComp.get("tabsId")
            }
            function _setSelected(comp)
            {
              comp.set("Selected", comp.get("PaneId") === newVal)
            }
            
            tabsComp.findAllComponents("TabsPane")
              .filter(_sameComponent)
              .map(_setSelected)
              
            tabsComp.findAllComponents("TabsLink")
              .filter(_sameComponent)
              .map(_setSelected)
              
            return false
          })
      }
    })
  }
})
