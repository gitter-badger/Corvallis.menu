

define(function(require)
{  
  if(!Ractive.components.TabsComponent)
  {
    //counter for the number of tabs components that have been created
    var numTabsComponents = 0
    function subCompInit()
    {
      var parentComp = this.get("tabsComp")
      var thisComp = this
      
      //set the tabsId for this component to that of its parent TabComponent
      this.set("tabsId", this.get("tabsId"))
      
      this.on("Select", 
        function()
        {          
          //create helper functions
          function _sameComponent(comp)
          {
            return comp.get("tabsId") === thisComp.get("tabsId")
          }
          function _setSelected(comp)
          {
            comp.set("Selected", comp.get("PaneId") === thisComp.get("PaneId"))
          }
          
          parentComp.findAllComponents("TabsPane")
            .filter(_sameComponent)
            .map(_setSelected)
            
          parentComp.findAllComponents("TabsLink")
            .filter(_sameComponent)
            .map(_setSelected)
        })
    }
    
    Ractive.components.TabsComponent = Ractive.extend({
      template:'{{>content}}',
      components:
      {
        //The link subcomponent that will be used to select a page
        TabsLink: Ractive.extend(
          {
            template: '<a on-tap="Select">{{>content}}</a>',
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
      
      //Assigns a tabsId to the component,
      //and assigns the select handlers for its subcomponents.
      init: function()
      {
        //calculate id for this new tabs component
        this.set("tabsId", numTabsComponents++)
        this.set("tabsComp", this)
      }
    })
  }
})