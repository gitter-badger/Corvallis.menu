

define(function(require)
{  
  if(!Ractive.components.TabsComponent)
  {
    var numTabsComponents = 0
    var onLinkClick
    
    var component = Ractive.extend({
      template:'{{>content}}',
      components:
      {
        TabsLink: Ractive.extend(
          {
            template: '<a tabsId={{tabsId}} on-tap="clicked">{{>content}}</a>',
            data: 
            { 
              Selected : false, 
              tabsId : -1
            }
          }),
        TabsPane: Ractive.extend(
          {
            template: '<div tabsId={{tabsId}} style={{>PaneStyle}}>{{>content}}</div>',
            data: 
            { 
              Selected : false,
              tabsId : -1
            },
            partials:
            {
              PaneStyle : '{{#if this.Selected}}display: block{{else}}display: none{{/if}}'
            }
          })
      },
      data: 
      {
      },
      init: function()
      {
        //calculate id for new tabs component
        var newId = numTabsComponents++
        
        //create helper methods used by init
        function _newComponent(comp)
        {
          return comp.data.tabsId == -1
        }
        function _initComponent(comp)
        {
          //change ID from -1 to the new id
          comp.set("tabsId", newId)
        }
        
        
        //set id on new tabs components
        this.findAllComponents("TabsPane")
          .filter(_newComponent)
          .map(_initComponent)
        this.findAllComponents("TabsLink")
          .filter(_newComponent)
          .map(_initComponent)
      
        if(onLinkClick) return
        onLinkClick = this.on('TabsLink.clicked', function(event)
        {
          //create helper functions
          function _sameComponent(comp)
          {
            return comp.data.tabsId == event.context.tabsId
          }
          function _setSelected(comp)
          {
            comp.set("Selected", comp.data.PaneId === event.context.PaneId)
          }
          
          this.findAllComponents("TabsPane")
            .filter(_sameComponent)
            .map(_setSelected)
            
          this.findAllComponents("TabsLink")
            .filter(_sameComponent)
            .map(_setSelected)
        })
      }
    })
    
    Ractive.components.TabsComponent = component
  }
  return true
})