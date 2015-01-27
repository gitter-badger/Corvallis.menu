

define(function(require)
{  
  if(!Ractive.components.TabsComponent)
  {
    //counter for the number of tabs components that have been created
    var numTabsComponents = 0
    
    Ractive.components.TabsComponent = Ractive.extend({
      template:'{{>content}}',
      components:
      {
        //The link subcomponent that will be used to select a page
        TabsLink: Ractive.extend(
          {
            template: '<a on-tap="Select">{{>content}}</a>',
            data: { Selected: false },
            init: function()
            {
              //set the tabsId for this component to that of its parent TabComponent
              this.set("tabsId", this.get("tabsId"))
            }
          }),
        //The pane subcomponent that will display a page
        TabsPane: Ractive.extend(
          {
            template: '<div  {{^Selected}} style="display: none" {{/Selected}}>{{>content}}</div>',
            data: { Selected: false },
            init: function()
            {
              //set the tabsId for this component to that of its parent TabComponent
              this.set("tabsId", this.get("tabsId"))
            }
          })
      },
      
      //Assigns a tabsId to the component,
      //and assigns the select handlers for its subcomponents.
      init: function()
      {
        //calculate id for this new tabs component
        this.set("tabsId", numTabsComponents++)
          
        //generate function to handle selection of a link or pane
        function onSelect(event)
        {
          //get the component 
          var currentComp = event.component
          
          //create helper functions
          function _sameComponent(comp)
          {
            return comp.get("tabsId") === currentComp.get("tabsId")
          }
          function _setSelected(comp)
          {
            comp.set("Selected", comp.get("PaneId") === currentComp.get("PaneId"))
          }
          
          this.findAllComponents("TabsPane")
            .filter(_sameComponent)
            .map(_setSelected)
            
          this.findAllComponents("TabsLink")
            .filter(_sameComponent)
            .map(_setSelected)
            
          //return false to stop bubbling up the component chain.
          return false
        }
        
        //apply Select functionality
        this.on("TabsLink.Select", onSelect)
        this.on("TabsPane.Select", onSelect)
      }
    })
  }
})